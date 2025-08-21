const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
require('dotenv').config(); // Load env variables

const app = express();
const port = process.env.PORT || 1000;

// ✅ Middleware to parse JSON request bodies
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
    process.exit(1); // Stop server if DB fails
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

// ✅ Insert a dummy user (only once for testing)
async function createDummyUser() {
  try {
    const user = new User({
      name: "John Doe",
      age: 25,
      email: "john@example.com"
    });
    const savedUser = await user.save();
    console.log("✅ Dummy user saved:", savedUser);
  } catch (err) {
    console.log("❌ Error saving user:", err);
  }
}
// Uncomment this line ONLY for first run
// createDummyUser();

// ✅ Order routes
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
