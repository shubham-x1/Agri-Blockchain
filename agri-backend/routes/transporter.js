const express = require("express");
const router = express.Router();
const Transporter = require("../models/Transporter");
const TransportDeal = require("../models/TransportDeal");
const Web3 = require("web3");
require("dotenv").config();

const web3 = new Web3(process.env.INFURA_URL);
const contractABI = require("../artifacts/contracts/trade.sol/Trade.json");
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

// Register Transporter
router.post("/register", async (req, res) => {
    const { name, walletAddress, location } = req.body;
    try {
        const transporter = new Transporter({ name, walletAddress, location });
        await transporter.save();
        res.json({ message: "Transporter registered successfully", transporter });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch Nearby Transport Deals
router.get("/:transporterId/nearby-deals", async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    try {
        const deals = await TransportDeal.find({
            pickupLocation: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
                }
            }
        });

        res.json({ deals });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept Transport Deal via Blockchain
router.post("/:transporterId/accept-deal", async (req, res) => {
    const { dealId, privateKey } = req.body;
    try {
        const transporter = await Transporter.findById(req.params.transporterId);
        if (!transporter) return res.status(404).json({ error: "Transporter not found" });

        const deal = await TransportDeal.findById(dealId);
        if (!deal) return res.status(404).json({ error: "Deal not found" });

        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        const tx = contract.methods.acceptTransportDeal(dealId);
        const gas = await tx.estimateGas({ from: transporter.walletAddress });
        const data = tx.encodeABI();
        const txObject = { to: contractAddress, gas, data };

        const signedTx = await account.signTransaction(txObject);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        deal.status = "Accepted";
        await deal.save();

        res.json({ message: "Transport deal accepted", receipt, deal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
