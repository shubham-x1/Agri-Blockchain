const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  type: String,
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  listedOnBlockchain: {
    type: Boolean,
    default: false,
  },
  harvestDate: Date,
  soilType: String,
  weatherDuringHarvest: String,
  pesticideUsed: String,
  fertilizerUsed: String,
  location: String,
  qualityGrade: String,
  moistureContent: Number,

  // ➡️ Add this line for storing multiple photos
  photos: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('Crop', cropSchema);
