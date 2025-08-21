const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// POST /signup
router.post("/signup", async (req, res) => {
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

module.exports = router;


// make sure Firebase Admin SDK is initialized in server.js


// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const router = express.Router();

// // Register route
// router.post("/register", async (req, res) => {
//   const { name, phone, email, password } = req.body;

//   try {
//     // Check if user already exists by email
//     const existingUserByEmail = await User.findOne({ email });
//     if (existingUserByEmail) {
//       return res.status(400).json({ message: "User already exists with this email" });
//     }

//     // Check if user already exists by phone number
//     const existingUserByPhone = await User.findOne({ phone });
//     if (existingUserByPhone) {
//       return res.status(400).json({ message: "Phone number is already in use" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       name,
//       phone,
//       email,
//       password: hashedPassword,
//     });

//     // Save user to database
//     await newUser.save();

//     res.status(201).json({
//       message: "User registered successfully",
//       user: { name: newUser.name, phone: newUser.phone, email: newUser.email },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Login route
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if the user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "User does not exist" });
//     }

//     // Compare the entered password with the stored hash
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET_KEY, // Ensure you set this in your .env file
//       { expiresIn: "1h" } // Token expiration time
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token, // Send the token back to the client
//       user: { name: user.name, phone: user.phone, email: user.email },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Protected route to get the logged-in user's data (requires token)
// router.get("/profile", async (req, res) => {
//   const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

//   if (!token) {
//     return res.status(401).json({ message: "Authentication token is missing" });
//   }

//   try {
//     // Verify JWT token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({
//       user: { name: user.name, phone: user.phone, email: user.email },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// });

// module.exports = router;
