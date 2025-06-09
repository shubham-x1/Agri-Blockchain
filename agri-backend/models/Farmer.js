const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: String,
  location: String,
  contact: String,
  crops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }],
  walletAddress: String,
  farmSize: Number,
  farmingExperience: Number,
  certification: String
});

module.exports = mongoose.model('Farmer', farmerSchema);;
