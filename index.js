const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const cors = require('cors'); // ✅ Add this
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Apply CORS before routes
app.use(cors({
  origin: "http://localhost:5173", // your frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options("*", cors()); // handle preflight requests

// ✅ Middleware to parse JSON
app.use(express.json());

// ✅ Initialize Firebase Admin SDK using .env
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    }),
  });
  console.log("✅ Firebase Admin initialized");
} catch (err) {
  console.error("❌ Firebase initialization error:", err);
}

// ✅ Connect to MongoDB using .env
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// ✅ Basic test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// ✅ Dummy user schema
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
});
const User = mongoose.model('User', userSchema);

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
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
