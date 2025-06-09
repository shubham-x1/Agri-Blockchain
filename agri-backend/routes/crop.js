const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

// Fetch all crops
router.get("/", async (req, res) => {
    try {
      const crops = await Crop.find()
        .populate("farmer", "name location") // Populate farmer's name and location
        .exec();
      res.json(crops);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
module.exports = router;

module.exports = router;
