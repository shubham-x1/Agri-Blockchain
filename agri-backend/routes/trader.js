const express = require("express");
const router = express.Router();
const Trader = require("../models/Trader");
const Order = require("../models/Order");
const Web3 = require("web3");
const dotenv = require("dotenv");
dotenv.config();

const web3 = new Web3(process.env.INFURA_URL);
const contractABI = require("../artifacts/contracts/trade.sol/Trade.json");
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

router.post("/register", async (req, res) => {
    const { name, walletAddress } = req.body;
    try {
        const trader = new Trader({ name, walletAddress });
        await trader.save();
        res.json({ message: "Trader registered successfully", trader });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//  Buy Crop via Blockchain
router.post("/:traderId/buy-crop", async (req, res) => {
    console.log("👉 Buy crop API hit");
    console.log("Trader ID from URL:", req.params.traderId);
    try {
        const trader = await Trader.findById(req.params.traderId);
        console.log("Fetched Trader:", trader);

        if (!trader) {
            console.log("❌ Trader not found");
            return res.status(404).json({ error: "Trader not found" });
        }

        // Rest of your code
    } catch (error) {
        console.log("❌ Error occurred:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
