/**
 * Create or Elevate Admin Script
 * 
 * Usage:
 *   node seed/createAdmin.js <email> <password> [name]
 * 
 * Examples:
 *   node seed/createAdmin.js admin@sewaconnect.org.in AdminSecurePass2026 "Main Admin"
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] || "Administrator";

if (!email || !password) {
  console.log("\n❌ Missing arguments!");
  console.log("Usage: node seed/createAdmin.js <email> <password> [name]");
  console.log("Example: node seed/createAdmin.js admin@sewaconnect.org.in SecurePass123 \"System Admin\"\n");
  process.exit(1);
}

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in your .env file!");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!");

    const formattedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: formattedEmail });

    if (user) {
      console.log(`\nℹ️  User with email "${formattedEmail}" already exists.`);
      console.log(`🔄 Elevating user role from "${user.role}" to "admin"...`);
      
      // Update role & optionally password
      user.role = "admin";
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
      
      await user.save();
      console.log("🎉 User role upgraded to ADMIN successfully!\n");
    } else {
      console.log(`\n🆕 Creating new administrator account for "${formattedEmail}"...`);
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name: name.trim(),
        email: formattedEmail,
        password: hashedPassword,
        role: "admin",
      });

      console.log("🎉 Administrator account created successfully!\n");
      console.log("Details:");
      console.log(`  Name:  ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role:  ${user.role}\n`);
    }

  } catch (error) {
    console.error("❌ Error running script:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

run();
