const mongoose = require("mongoose");

const transporterSchema = new mongoose.Schema({
  name: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } 
  },
  vehicleType: String,
  capacity: Number,
  walletAddress: String,
  available: Boolean,
  rating: Number
});

transporterSchema.index({ location: "2dsphere" }); // Geospatial index

module.exports = mongoose.model("Transporter", transporterSchema);
