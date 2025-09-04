const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  service: String,
  quantity: Number,
  price: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  pincode: String,
  city: String,
  state: String,
  landmark: String,
  services: [serviceSchema],
  totalPrice: Number,
  paymentMethod: String,
  status: {
  type: String,
  enum: ["pending", "confirmed", "completed", "cancelled"],
  default: "pending"
},

  placedAt: {
    type: Date,
    default: Date.now
  }
});


// ✅ Fix: Prevent OverwriteModelError
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
