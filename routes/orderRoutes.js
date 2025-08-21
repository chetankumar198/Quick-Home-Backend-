const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // ✅ Use imported model

// ✅ Validate order fields
const validateOrderData = (data) => {
  if (!data.name || !data.phone || !data.address || !data.pincode || !data.city || !data.state || !data.services) {
    return { error: 'All fields are required' };
  }

  if (data.phone.length !== 10 || !/^\d+$/.test(data.phone)) {
    return { error: 'Phone number must be 10 digits' };
  }

  if (!Array.isArray(data.services) || data.services.length === 0) {
    return { error: 'At least one service must be included in the order' };
  }

  return null;
};

// ✅ Handle POST /api/orders/place-order
router.post('/place-order', async (req, res) => {
  console.log("📦 Incoming order data:", req.body);

  const validationError = validateOrderData(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError.error });
  }

  try {
    const newOrder = new Order(req.body); // ✅ CORRECT usage here
    await newOrder.save();

    console.log('✅ Order saved to MongoDB:', newOrder);
    res.status(201).json({
      message: '✅ Order placed successfully!',
      order: newOrder
    });
  } catch (error) {
    console.error('❌ Order saving failed:', error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});

// GET all orders with filters & search
router.get("/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const { status, orderName, timeFilter } = req.query;

    const query = {};

    if (orderName) {
      query["services.service"] = { $regex: orderName, $options: "i" };
    }

    if (timeFilter === "30days") {
      const date30 = new Date();
      date30.setDate(date30.getDate() - 30);
      query.placedAt = { $gte: date30 };
    } else if (["2025", "2024", "2023"].includes(timeFilter)) {
      const year = parseInt(timeFilter);
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year + 1}-01-01`);
      query.placedAt = { $gte: start, $lt: end };
    } else if (timeFilter === "older") {
      query.placedAt = { $lt: new Date("2023-01-01") };
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ placedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
});



module.exports = router;
