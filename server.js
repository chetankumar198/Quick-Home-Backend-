const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ✅ Full CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Handle preflight OPTIONS requests
app.options("*", cors());

// ✅ Parse JSON
app.use(express.json());

// ✅ Firebase Admin Init
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ MongoDB Connection
mongoose.connect(
  "mongodb+srv://chetankumar8051:TEywoKIrjTBKP4C3@cluster0.i84o5ob.mongodb.net/quickhome?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Order Schema & Model
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

// ✅ Order routes
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// ✅ Signup
app.post("/signup", async (req, res) => {
  const { phone, password, name, email } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      phoneNumber: `+91${phone}`,
      password,
      displayName: name,
      email: email || undefined,
    });

    const token = await admin.auth().createCustomToken(userRecord.uid);
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const userRecord = await admin.auth().getUserByPhoneNumber(`+91${phone}`);
    const token = await admin.auth().createCustomToken(userRecord.uid);
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// ✅ Start server
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
