require("dotenv").config();
const { ethers, formatEther, parseEther } = require("ethers");
const mongoose = require("mongoose");

// MongoDB config
const connectDB = require("../config/database");

// Models
const Crop = require("../models/Crop");
const Farmer = require("../models/Farmer");
const Trader = require("../models/Trader");
const Transporter = require("../models/Transporter");
const Order = require("../models/Order");
const TransportDeal = require("../models/TransportDeal");

// Contract details
const INFURA_URL = process.env.INFURA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const contractABI = require("../artifacts/contracts/trade.sol/Trade.json").abi;

async function main() {
    await connectDB();
    console.log("✅ MongoDB connected");

    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const Trade = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
    console.log(`🔗 Connected to contract: ${CONTRACT_ADDRESS}`);

    // --- Create Farmer ---
    const farmer = await new Farmer({
        name: "Ravi Farmer",
        walletAddress: wallet.address,
        location: "Punjab",
    }).save();
    console.log("🧑‍🌾 Farmer created");

    // --- List Crop on Blockchain (NEW addCrop) ---
    const cropName = "Rice";
    const cropPrice = parseEther("0.01");
    const cropQuantity = 100;

    const addCropTx = await Trade.addCrop(cropName, cropPrice, cropQuantity);
    await addCropTx.wait();
    console.log("🧺 Crop added on blockchain");

    // --- Fetch Crop from Contract ---
    const cropCount = await Trade.cropCount();
    const crop = await Trade.crops(cropCount);
    const cropPriceEther = formatEther(crop[2]); // crop[2] = price
    const quantityFromBlockchain = crop[3]; // crop[3] = quantity

    // --- Save Crop to MongoDB ---
    const newCrop = await new Crop({
        name: cropName,
        price: Number(cropPriceEther),           // 🔵 just in case price also
        quantity: Number(quantityFromBlockchain),
        type: "Grain",
        farmer: farmer._id,
        listedOnBlockchain: true,
        harvestDate: new Date("2024-12-15"),
        soilType: "Loamy",
        weatherDuringHarvest: "Sunny",
        pesticideUsed: "Pesticide A",
        fertilizerUsed: "Fertilizer B",
        location: "Punjab",
        qualityGrade: "A",
        moistureContent: 12.5
    }).save();
    console.log("🌾 Crop saved to DB");

    // --- Create Trader ---
    const trader = await new Trader({
        name: "Rakesh Trader",
        location: "Delhi",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    }).save();
    console.log("👨‍💼 Trader created");

    // --- Create Transporter ---
    const transporter = await new Transporter({
        name: "Sharma Logistics",
        location: {
            type: "Point",
            coordinates: [77.1025, 28.7041] // Delhi coordinates
        },
        vehicleType: "Truck",
        capacity: 100,
        walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        available: true,
        rating: 4.5
    }).save();
    console.log("🚚 Transporter created");

    // --- Buy Crop on Blockchain ---
    const buyTx = await Trade.buyCrop(cropCount, { value: cropPrice });
    await buyTx.wait();
    console.log("🛒 Crop purchased on-chain");

    const updatedCrop = await Trade.crops(cropCount);

    // --- Update Crop in MongoDB ---
    await Crop.findOneAndUpdate(
        { _id: newCrop._id },
        { sold: updatedCrop[5] } // crop[5] = sold (bool)
    );
    console.log("♻️ Crop updated in DB");

    // --- Create Order in MongoDB ---
    const order = await new Order({
        traderWallet: trader.walletAddress,
        crop: newCrop._id,
        quantity: 1,
        price: cropPriceEther,
        status: "Ordered",
        transactionHash: buyTx.hash,
        orderDate: new Date(),
        deliveryDate: new Date("2024-12-20"),
        paymentMethod: "Ether"
    }).save();
    console.log("📦 Order saved");

    // --- Create Transport Deal ---
    const transportDeal = await new TransportDeal({
        crop: newCrop._id,
        farmer: farmer._id,
        pickupLocation: {
            type: "Point",
            coordinates: [77.1025, 28.7041]
        },
        dropLocation: {
            type: "Point",
            coordinates: [77.2090, 28.6139]
        },
        distance: 200,
        price: cropPriceEther,
        status: "Pending",
        listedOnBlockchain: true,
    }).save();
    console.log("🚛 Transport Deal saved");

    console.log("🎉 All data synced successfully!");
}

main().catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
});
