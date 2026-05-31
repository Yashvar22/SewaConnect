const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected!");

    // Simple schema definition
    const ngoSchema = new mongoose.Schema({}, { strict: false });
    const NGO = mongoose.model("NGO", ngoSchema, "ngos");

    const ngos = await NGO.find({});
    console.log(`\nFound ${ngos.length} NGOs in database:`);
    ngos.forEach((n, idx) => {
      console.log(`${idx + 1}. Name: "${n.get("name")}"`);
      console.log(`   ID: ${n._id}`);
      console.log(`   verified: ${n.get("verified")}`);
      console.log(`   rejected: ${n.get("rejected")}`);
      console.log(`   createdBy: ${n.get("createdBy")}`);
      console.log(`   createdAt: ${n.get("createdAt")}`);
      console.log("-----------------------------------------");
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

run();
