const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    traderWallet: String,
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    quantity: Number,
    price: Number,
    status: String,
    transactionHash: String,
    orderDate: Date,
    deliveryDate: Date,
    paymentMethod: String
  });
  
  module.exports = mongoose.model('Order', orderSchema);