const express = require("express");
const router = express.Router();
const Web3 = require("web3");
const Order = require("../models/Order");
const dotenv = require("dotenv");
dotenv.config();

// Web3 setup
const web3 = new Web3(process.env.INFURA_URL);
const contractABI = require("../artifacts/contracts/trade.sol/Trade.json").abi; // Fixed ABI import
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Middleware to parse JSON bodies
router.use(express.json());

// Buy a Crop
router.post("/buy", async (req, res) => {
    const { traderWallet, cropId, quantity, privateKey } = req.body;

    try {
        console.log("Received buy request:", { 
            traderWallet, 
            cropId, 
            quantity, 
            privateKey: privateKey ? "****" : undefined // Mask private key for security
        });

        // Validate fields
        if (!traderWallet) return res.status(400).json({ error: "Trader wallet address is required" });
        if (!cropId) return res.status(400).json({ error: "Crop ID is required" });
        if (!quantity || quantity <= 0) return res.status(400).json({ error: "Valid quantity is required" });
        if (!privateKey) return res.status(400).json({ error: "Private key is required" });

        // Check if wallet address is valid
        if (!web3.utils.isAddress(traderWallet)) {
            return res.status(400).json({ error: "Invalid trader wallet address" });
        }

        // Validate private key
        try {
            const account = web3.eth.accounts.privateKeyToAccount(privateKey);
            if (account.address.toLowerCase() !== traderWallet.toLowerCase()) {
                return res.status(400).json({ error: "Private key does not match trader wallet address" });
            }
        } catch (err) {
            return res.status(400).json({ error: "Invalid private key" });
        }

        // Fetch crop details
        const crop = await contract.methods.crops(cropId).call();
        console.log("Fetched crop details:", crop);

        if (!crop || crop.quantity === '0') {
            return res.status(404).json({ error: "Crop not found or unavailable" });
        }

        if (Number(crop.quantity) < quantity) {
            return res.status(400).json({ error: "Not enough crop available" });
        }

        // Price per crop and total price calculation
        const pricePerCrop = web3.utils.toBN(crop.price); // price per 1 crop in Wei
        const totalPrice = pricePerCrop.mul(web3.utils.toBN(quantity)); // total price for quantity of crops

        // Fetch trader's balance
        const balance = await web3.eth.getBalance(traderWallet);
        if (web3.utils.toBN(balance).lt(totalPrice)) {
            return res.status(400).json({ error: "Not enough Sepolia ETH to buy the crop" });
        }

        const account = web3.eth.accounts.privateKeyToAccount(privateKey);

        // Create the transaction object for the contract method buyCrop
        const tx = contract.methods.buyCrop(cropId); // Only passing cropId since the contract expects one parameter

        // Estimate gas for the transaction
        const gas = await tx.estimateGas({ 
            from: traderWallet, 
            value: totalPrice.toString() // Total price in Wei
        }).catch(error => {
            console.error("Gas estimation error:", error);
            throw new Error("Failed to estimate gas: " + error.message);
        });

        // Get current gas price
        const gasPrice = await web3.eth.getGasPrice();

        // Encode the transaction data
        const data = tx.encodeABI();

        // Transaction object
        const txObject = {
            from: traderWallet,
            to: contractAddress,
            gas: Math.floor(gas * 1.2), // Add 20% buffer for gas
            gasPrice,
            data,
            value: totalPrice.toString() // Total price in Wei
        };

        console.log("Signing transaction:", {
            to: txObject.to,
            gas: txObject.gas,
            value: txObject.value
        });

        // Sign the transaction
        const signedTx = await account.signTransaction(txObject);
        console.log("Transaction signed, sending to blockchain...");
        
        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("Transaction confirmed:", receipt.transactionHash);

        // Save order details to MongoDB
        const order = new Order({
            traderWallet,
            cropId,
            quantity,
            price: totalPrice.toString(), // Save total price
            status: "Pending",
            transactionHash: receipt.transactionHash,
            timestamp: new Date()
        });

        await order.save();

        res.json({ 
            message: "Transaction successful", 
            transactionHash: receipt.transactionHash,
            order: order._id
        });

    } catch (error) {
        console.error("Error in buy-crop:", error);
        
        // More informative error response
        if (error.message.includes("insufficient funds")) {
            return res.status(400).json({ error: "Insufficient funds for transaction" });
        } else if (error.message.includes("nonce")) {
            return res.status(400).json({ error: "Nonce error, please try again" });
        }
        
        res.status(500).json({ 
            error: "Transaction failed", 
            details: error.message
        });
    }
});

// Cancel an Order
router.post("/cancel/:orderId", async (req, res) => {
    const { privateKey } = req.body;

    try {
        if (!privateKey) {
            return res.status(400).json({ error: "Private key is required" });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        if (order.status !== "Pending") {
            return res.status(400).json({ error: "Only pending orders can be cancelled" });
        }

        let account;
        try {
            account = web3.eth.accounts.privateKeyToAccount(privateKey);
        } catch (err) {
            return res.status(400).json({ error: "Invalid private key" });
        }

        // Verify private key matches trader wallet
        if (account.address.toLowerCase() !== order.traderWallet.toLowerCase()) {
            return res.status(403).json({ error: "Private key does not match order trader wallet" });
        }

        // Create transaction for cancellation
        const tx = contract.methods.cancelOrder(order.cropId, order.quantity); // Assumed contract method
        const gas = await tx.estimateGas({ from: account.address }).catch(error => {
            console.error("Gas estimation error:", error);
            throw new Error("Failed to estimate gas for cancellation: " + error.message);
        });
        
        const gasPrice = await web3.eth.getGasPrice();
        const data = tx.encodeABI();

        const txObject = {
            from: account.address,
            to: contractAddress,
            gas: Math.floor(gas * 1.2), // Add 20% buffer
            gasPrice,
            data
        };

        console.log("Signing cancellation transaction");
        const signedTx = await account.signTransaction(txObject);
        console.log("Sending cancellation to blockchain...");
        
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("Cancellation confirmed:", receipt.transactionHash);

        // Update order status
        order.status = "Cancelled";
        order.cancelledAt = new Date();
        await order.save();

        res.json({ 
            message: "Order cancelled successfully", 
            transactionHash: receipt.transactionHash,
            orderId: order._id
        });

    } catch (error) {
        console.error("Error in /cancel:", error);
        res.status(500).json({ 
            error: "Failed to cancel order", 
            details: error.message 
        });
    }
});

// Get order details
router.get("/:orderId", async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });
        
        res.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all orders (with optional filters)
router.get("/", async (req, res) => {
    try {
        const { traderWallet, status } = req.query;
        const filter = {};
        
        if (traderWallet) filter.traderWallet = traderWallet;
        if (status) filter.status = status;
        
        const orders = await Order.find(filter).sort({ timestamp: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;