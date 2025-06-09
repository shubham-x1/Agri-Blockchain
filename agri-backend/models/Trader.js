const mongoose = require("mongoose");

const traderSchema = new mongoose.Schema({
    name: String,
    location: String,
    walletAddress: String
});

module.exports = mongoose.model("Trader", traderSchema);
