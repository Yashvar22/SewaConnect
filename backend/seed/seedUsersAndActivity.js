/**
 * Seed Script — 15 Volunteers + 15 Donors
 *
 * - Creates 15 user accounts (role: "user") as volunteers
 * - Creates 15 user accounts (role: "user") as donors
 * - Attaches volunteer applications to existing events (or creates sample events if none)
 * - Attaches donation records to existing NGOs
 *
 * Run: node seed/seedUsersAndActivity.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User      = require("../models/User");
const NGO       = require("../models/NGO");
const Event     = require("../models/Event");
const Volunteer = require("../models/Volunteer");
const Donation  = require("../models/Donation");

// ── Volunteer user data ────────────────────────────────────────────────────
const VOLUNTEERS = [
  { name: "Aarav Sharma",    email: "aarav.sharma@volunteer.dev" },
  { name: "Priya Mehta",     email: "priya.mehta@volunteer.dev" },
  { name: "Rohan Verma",     email: "rohan.verma@volunteer.dev" },
  { name: "Sneha Gupta",     email: "sneha.gupta@volunteer.dev" },
  { name: "Kunal Joshi",     email: "kunal.joshi@volunteer.dev" },
  { name: "Divya Nair",      email: "divya.nair@volunteer.dev" },
  { name: "Arjun Kapoor",    email: "arjun.kapoor@volunteer.dev" },
  { name: "Pooja Tiwari",    email: "pooja.tiwari@volunteer.dev" },
  { name: "Rahul Singh",     email: "rahul.singh@volunteer.dev" },
  { name: "Ananya Mishra",   email: "ananya.mishra@volunteer.dev" },
  { name: "Vikram Yadav",    email: "vikram.yadav@volunteer.dev" },
  { name: "Nisha Patel",     email: "nisha.patel@volunteer.dev" },
  { name: "Aditya Kumar",    email: "aditya.kumar@volunteer.dev" },
  { name: "Meera Reddy",     email: "meera.reddy@volunteer.dev" },
  { name: "Siddharth Bose",  email: "siddharth.bose@volunteer.dev" },
];

// ── Donor user data ────────────────────────────────────────────────────────
const DONORS = [
  { name: "Kavita Agarwal",   email: "kavita.agarwal@donor.dev" },
  { name: "Suresh Chandra",   email: "suresh.chandra@donor.dev" },
  { name: "Lakshmi Iyer",     email: "lakshmi.iyer@donor.dev" },
  { name: "Manish Bhatt",     email: "manish.bhatt@donor.dev" },
  { name: "Tanya Malhotra",   email: "tanya.malhotra@donor.dev" },
  { name: "Deepak Saxena",    email: "deepak.saxena@donor.dev" },
  { name: "Ritu Sharma",      email: "ritu.sharma@donor.dev" },
  { name: "Ashok Pillai",     email: "ashok.pillai@donor.dev" },
  { name: "Neha Srivastava",  email: "neha.srivastava@donor.dev" },
  { name: "Gaurav Khanna",    email: "gaurav.khanna@donor.dev" },
  { name: "Sunita Rawat",     email: "sunita.rawat@donor.dev" },
  { name: "Rajesh Walia",     email: "rajesh.walia@donor.dev" },
  { name: "Preeti Chopra",    email: "preeti.chopra@donor.dev" },
  { name: "Amit Grover",      email: "amit.grover@donor.dev" },
  { name: "Shweta Batra",     email: "shweta.batra@donor.dev" },
];

// ── Item donation templates ────────────────────────────────────────────────
const ITEM_DONATIONS = [
  { itemName: "Winter Clothes Bundle",   description: "50 sets of warm clothes for children — jackets, sweaters and socks." },
  { itemName: "Stationery Kit",          description: "150 stationery sets including notebooks, pens, pencils and geometry boxes." },
  { itemName: "Rice & Dal",             description: "100 kg rice and 50 kg dal for community kitchen distribution." },
  { itemName: "Medical Supplies",        description: "First aid kits, bandages and OTC medicines for the health camp." },
  { itemName: "Old Books & Textbooks",   description: "School and college books for the free library program." },
  { itemName: "Baby Care Kit",           description: "Diapers, baby soap, oil and powder for mothers in the shelter home." },
  { itemName: "Blankets",               description: "30 thick blankets for the winter drive benefiting homeless families." },
  { itemName: "Footwear",               description: "60 pairs of sandals and shoes collected from housing society drive." },
  { itemName: "Packaged Food",           description: "250 packets of biscuits, instant noodles and dry fruits." },
  { itemName: "Toys & Games",           description: "Pre-loved toys and board games for the children's daycare centre." },
];

// ── Money donation amounts ─────────────────────────────────────────────────
const AMOUNTS = [500, 1000, 1500, 2000, 2500, 5000, 3000, 750, 1200, 4000, 800, 2200, 1750, 600, 3500];

// ── Sample events to create if DB has none ────────────────────────────────
const SAMPLE_EVENTS = [
  { title: "Tree Plantation Drive — Aravalli",  description: "Join us to plant 1000+ saplings in the Aravalli Biodiversity Park.", location: "Mehrauli, New Delhi", date: new Date("2026-06-15") },
  { title: "Food Distribution — ISBT",          description: "Distributing hot meals to migrant workers at Kashmere Gate.", location: "Kashmere Gate, New Delhi", date: new Date("2026-05-20") },
  { title: "Free Health Camp — Sangam Vihar",   description: "Free blood tests, BP checks and doctor consultations.", location: "Sangam Vihar, New Delhi", date: new Date("2026-05-28") },
  { title: "Street Children Education Drive",   description: "Weekend classes for underprivileged children at the community centre.", location: "Paharganj, New Delhi", date: new Date("2026-06-07") },
  { title: "Clothes Collection & Distribution", description: "Collect and sort donated clothes for rural communities in Haryana.", location: "Gurugram, Haryana", date: new Date("2026-06-01") },
  { title: "Animal Rescue Awareness Walk",       description: "Awareness march for stray animal welfare and adoption in Noida.", location: "Sector 18, Noida", date: new Date("2026-06-21") },
  { title: "Winter Blanket Drive",              description: "Distribute blankets to homeless families in Old Delhi.", location: "Chandni Chowk, New Delhi", date: new Date("2026-12-15") },
  { title: "Clean Yamuna Cleanliness Campaign", description: "Cleaning Yamuna Ghat and raising awareness about river pollution.", location: "ITO Ghat, New Delhi", date: new Date("2026-07-10") },
];

// Helper: pick a random item from an array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    const hashedPwd = await bcrypt.hash("Volunteer@2026", 10);

    // ── STEP 1: Get existing NGOs ──────────────────────────────
    const ngos = await NGO.find({ verified: true });
    if (ngos.length === 0) {
      console.error("❌ No verified NGOs found. Please run seedNGOs.js first.");
      process.exit(1);
    }
    console.log(`ℹ️  Found ${ngos.length} verified NGOs`);

    // ── STEP 2: Get or create events ───────────────────────────
    let events = await Event.find();
    if (events.length === 0) {
      console.log("ℹ️  No events found — creating 8 sample events...");
      for (const ev of SAMPLE_EVENTS) {
        const ngo = pick(ngos);
        await Event.create({ ...ev, ngoId: ngo._id });
      }
      events = await Event.find();
      console.log(`✅ Created ${events.length} sample events\n`);
    } else {
      console.log(`ℹ️  Found ${events.length} existing events\n`);
    }

    // ── STEP 3: Seed 15 Volunteers ────────────────────────────
    console.log("── Seeding Volunteers ──────────────────────────────────");
    let volInserted = 0, volSkipped = 0;

    for (let i = 0; i < VOLUNTEERS.length; i++) {
      const vData = VOLUNTEERS[i];

      // Create or find user
      let user = await User.findOne({ email: vData.email });
      if (!user) {
        user = await User.create({ ...vData, password: hashedPwd, role: "user" });
      }

      // Assign 1-3 volunteer applications per user
      const appCount = (i % 3) + 1;
      const usedEventIds = new Set();

      for (let j = 0; j < appCount; j++) {
        // pick a unique event for this user
        let evt;
        let attempts = 0;
        do { evt = pick(events); attempts++; } while (usedEventIds.has(evt._id.toString()) && attempts < 20);
        if (attempts >= 20) continue;
        usedEventIds.add(evt._id.toString());

        const exists = await Volunteer.findOne({ userId: user._id, eventId: evt._id });
        if (exists) continue;

        const status = i % 5 === 0 ? "approved" : "pending";
        await Volunteer.create({ userId: user._id, eventId: evt._id, status });
      }

      console.log(`✅ Volunteer: ${vData.name} <${vData.email}>`);
      volInserted++;
    }

    // ── STEP 4: Seed 15 Donors ────────────────────────────────
    console.log("\n── Seeding Donors ─────────────────────────────────────");
    let donInserted = 0;

    for (let i = 0; i < DONORS.length; i++) {
      const dData = DONORS[i];

      // Create or find user
      let user = await User.findOne({ email: dData.email });
      if (!user) {
        user = await User.create({ ...dData, password: hashedPwd, role: "user" });
      }

      const ngo = pick(ngos);

      if (i % 2 === 0) {
        // Money donation
        const amount = AMOUNTS[i];
        await Donation.create({
          type:        "money",
          amount,
          description: `Monthly financial support for ${ngo.name}'s ongoing programs.`,
          donorId:     user._id,
          ngoId:       ngo._id,
        });
        console.log(`✅ Donor (money ₹${amount}): ${dData.name}`);
      } else {
        // Item donation
        const item = ITEM_DONATIONS[Math.floor(i / 2) % ITEM_DONATIONS.length];
        await Donation.create({
          type:          "item",
          itemName:      item.itemName,
          description:   item.description,
          pickupOption:  i % 4 === 1 ? "pickup" : "drop",
          pickupAddress: `${Math.floor(Math.random() * 200) + 1}, Some Colony, ${ngo.location || "New Delhi"}`,
          donorId:       user._id,
          ngoId:         ngo._id,
        });
        console.log(`✅ Donor (item "${item.itemName}"): ${dData.name}`);
      }
      donInserted++;
    }

    // ── SUMMARY ───────────────────────────────────────────────
    console.log("\n══════════════════════════════════════════════════════");
    console.log(`  Volunteers created  : ${volInserted}`);
    console.log(`  Donors created      : ${donInserted}`);
    console.log(`  Sample events used  : ${events.length}`);
    console.log("══════════════════════════════════════════════════════");
    console.log("\n  Default password for all seeded users: Volunteer@2026\n");

  } catch (err) {
    console.error("❌ Seed error:", err.message);
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

seed();
