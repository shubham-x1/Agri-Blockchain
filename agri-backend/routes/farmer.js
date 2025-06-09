const express = require("express");
const router = express.Router();
const Farmer = require("../models/Farmer");
const Crop = require("../models/Crop");
const Web3 = require("web3");
const dotenv = require("dotenv");
dotenv.config();

// Web3 setup
const web3 = new Web3(process.env.INFURA_URL);
const contractABI = require("../artifacts/contracts/trade.sol/Trade.json");
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

// Middleware
router.use(express.json());

// Register Farmer
router.post("/register", async (req, res) => {
  const { name, walletAddress } = req.body;

  try {
    const farmer = new Farmer({ name, walletAddress });
    await farmer.save();

    res.json({ message: "Farmer registered successfully", farmer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Crop and List on Blockchain
router.post("/:farmerId/add-crop", async (req, res) => {
  const {
    name,
    price,
    quantity,
    type,
    harvestDate,
    soilType,
    weatherDuringHarvest,
    pesticideUsed,
    fertilizerUsed,
    location,
    qualityGrade,
    moistureContent,
    listedOnBlockchain,  // new field to accept listed or not
    privateKey,
    photos = [],  // accept uploaded photos (optional)
  } = req.body;

  try {
    const farmer = await Farmer.findById(req.params.farmerId);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });

    const crop = new Crop({
      name,
      price,
      quantity,
      type,
      farmer: farmer._id,
      listedOnBlockchain: false, // initially false
      harvestDate,
      soilType,
      weatherDuringHarvest,
      pesticideUsed,
      fertilizerUsed,
      location,
      qualityGrade,
      moistureContent,
      photos, // store uploaded photo paths
    });

    await crop.save();

    if (listedOnBlockchain) {
      // Blockchain interaction
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);

      const tx = contract.methods.addCrop(name, price, quantity);
      const gas = await tx.estimateGas({ from: account.address });
      const data = tx.encodeABI();

      const txObject = {
        to: contractAddress,
        gas,
        data,
      };

      const signedTx = await account.signTransaction(txObject);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      crop.listedOnBlockchain = true;
      await crop.save();

      return res.json({ message: "Crop listed successfully on blockchain", receipt, crop });
    }

    res.json({ message: "Crop added locally (not on blockchain)", crop });

  } catch (error) {
    console.error("Error in add-crop:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
