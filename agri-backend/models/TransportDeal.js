const mongoose = require('mongoose');
const transportDealSchema = new mongoose.Schema({
    crop: { type: mongoose.Schema.Types.ObjectId, ref: "Crop" },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
    pickupLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }
    },
    dropLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }
    },
    distance: Number,
    price: Number,
    status: String,
    listedOnBlockchain: Boolean,
    createdAt: { type: Date, default: Date.now }
  });
  
  transportDealSchema.index({ pickupLocation: "2dsphere" });
  
  module.exports = mongoose.model("TransportDeal", transportDealSchema);
  