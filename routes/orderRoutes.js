const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// ✅ Order Model
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
  status: { type: String, enum: ["pending","confirmed","completed","cancelled"], default: "pending" },
  placedAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// ✅ Validate order
const validateOrderData = (data) => {
  if (!data.name || !data.phone || !data.address || !data.pincode || !data.city || !data.services) {
    return { error: "Name, phone, address, pincode, city, and services are required" };
  }
  if (data.phone.length !== 10 || !/^\d+$/.test(data.phone)) {
    return { error: "Phone number must be 10 digits" };
  }
  if (!Array.isArray(data.services) || data.services.length === 0) {
    return { error: "At least one service must be included in the order" };
  }
  return null;
};

// ✅ Place order
router.post("/place-order", async (req, res) => {
  try {
    const error = validateOrderData(req.body);
    if (error) return res.status(400).json(error);

    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to place order" });
  }
});


// ✅ Get all orders with filters
router.get("/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const { status, orderName, timeFilter } = req.query;
    const query = {};

    if (orderName) query["services.service"] = { $regex: orderName, $options: "i" };

    if (timeFilter === "30days") {
      const date30 = new Date();
      date30.setDate(date30.getDate() - 30);
      query.placedAt = { $gte: date30 };
    } else if (["2025","2024","2023"].includes(timeFilter)) {
      const year = parseInt(timeFilter);
      query.placedAt = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year+1}-01-01`) };
    } else if (timeFilter === "older") {
      query.placedAt = { $lt: new Date("2023-01-01") };
    }

    if (status) query.status = status;

    const orders = await Order.find(query).sort({ placedAt: -1 }).skip(skip).limit(limit);
    res.status(200).json({ orders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
