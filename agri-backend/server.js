const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Web3 = require("web3");

dotenv.config();
const app = express();

// Database Connection
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name'; // Set a default URI if not defined in .env
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);  // Exit process if MongoDB connection fails
    });

// Web3 Setup
const web3 = new Web3(process.env.INFURA_URL);
const contractABI = require("./artifacts/contracts/trade.sol/Trade.json");

const contractAddress = process.env.CONTRACT_ADDRESS;
// Create the contract instance using the ABI from the JSON file
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

// Middleware
app.use(express.json({ limit: "50mb" }));  // Use express.json instead of bodyParser
app.use(cors());  // Allow cross-origin requests
app.use(express.static(path.join(__dirname, "/frontend/build")));  // Serve static files for frontend

// Routes
const farmerRoutes = require("./routes/farmer");
const traderRoutes = require("./routes/trader");
const transporterRoutes = require("./routes/transporter");
const orderRoutes = require("./routes/order");
const cropRoutes = require("./routes/crop");

app.use("/api/farmer", farmerRoutes);
app.use("/api/trader", traderRoutes);
app.use("/api/transporter", transporterRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/crop", cropRoutes);

// Static Files (React Frontend + Uploads)
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Frontend Routing (for React app)
app.get("*", (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "/frontend/build/index.html"));
    } catch (e) {
        res.status(500).send("Oops! Unexpected error.");
    }
});

// MongoDB Event Listeners
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err.message);
});

mongoose.connection.once('open', () => {
    console.log('MongoDB connected');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
