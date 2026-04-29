/**
 * Seed Script — 15 Delhi NCR NGOs
 * Run: node seed/seedNGOs.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");
const NGO      = require("../models/NGO");

const SEEDER_EMAIL    = "ngo.seeder@ngoconnect.dev";
const SEEDER_PASSWORD = "Seeder@2026";

const NGO_DATA = [
  {
    name: "Smile Foundation",
    description:
      "Smile Foundation works for the welfare of underprivileged children and youth by providing education, healthcare and livelihood interventions across India.",
    location: "Okhla, New Delhi",
    category: "education",
    contact: "+91 11 4310 1400",
    website: "https://www.smilefoundationindia.org",
  },
  {
    name: "Goonj",
    description:
      "Goonj channels urban material—clothes, food, medicines—as a development resource for rural and disaster-hit communities across India. Founded in 1999 in Delhi.",
    location: "Delhi, New Delhi",
    category: "disaster",
    contact: "+91 11 2652 5400",
    website: "https://goonj.org",
  },
  {
    name: "Deepalaya",
    description:
      "Deepalaya has been providing integrated development services for the underprivileged in Delhi since 1979, focusing on education, vocational training and women empowerment.",
    location: "Kalkaji, New Delhi",
    category: "education",
    contact: "+91 11 2922 6985",
    website: "https://www.deepalaya.org",
  },
  {
    name: "Salaam Baalak Trust",
    description:
      "Salaam Baalak Trust provides shelter, food, and education to street and working children in Delhi, protecting them from exploitation and violence.",
    location: "Paharganj, New Delhi",
    category: "youth",
    contact: "+91 11 2358 4164",
    website: "https://www.salaambaalaktrust.com",
  },
  {
    name: "HelpAge India",
    description:
      "HelpAge India is a leading charity in India working with and for disadvantaged elderly for over 50 years — providing healthcare, income support, and protection.",
    location: "Lajpat Nagar, New Delhi",
    contact: "+91 11 4168 0050",
    category: "health",
    website: "https://www.helpageindia.org",
  },
  {
    name: "Robin Hood Army Delhi",
    description:
      "Robin Hood Army is a zero-funds volunteer organization that collects surplus food from restaurants and distributes it to the homeless in Delhi NCR.",
    location: "Connaught Place, New Delhi",
    category: "food",
    contact: "contact@robinhoodarmy.com",
    website: "https://robinhoodarmy.com",
  },
  {
    name: "Uday Foundation",
    description:
      "Uday Foundation works to ensure that no child dies due to lack of money. They provide medical assistance, neonatal care, and support to critically ill children across Delhi.",
    location: "Rohini, New Delhi",
    category: "health",
    contact: "+91 98914 35515",
    website: "https://www.udayfoundation.org",
  },
  {
    name: "Navjyoti India Foundation",
    description:
      "Navjyoti India Foundation empowers marginalized communities of Delhi through education, skill development, and community policing programs since 1988.",
    location: "Palam, New Delhi",
    category: "women",
    contact: "+91 11 2545 2274",
    website: "https://www.navjyoti.org.in",
  },
  {
    name: "Wildlife SOS",
    description:
      "Wildlife SOS rescues and rehabilitates wildlife in crisis across India. Their Elephant Conservation and Care Centre and bear rescue programs operate near Delhi.",
    location: "Mathura Road, Faridabad",
    category: "animal",
    contact: "+91 98 1800 0013",
    website: "https://wildlifesos.org",
  },
  {
    name: "Environics Trust",
    description:
      "Environics Trust works at the intersection of environment, health, and rights — conducting research and advocacy for communities vulnerable to industrial and climate pollution.",
    location: "Jasola, New Delhi",
    category: "environment",
    contact: "+91 11 4174 0300",
    website: "https://www.environicsindia.in",
  },
  {
    name: "Pratham Delhi Education Initiative",
    description:
      "Pratham is one of India's largest NGOs working on improving the quality of primary education. Their Delhi chapter runs learning camps and teacher training programs.",
    location: "Jhandewalan, New Delhi",
    category: "education",
    contact: "+91 11 4737 0000",
    website: "https://www.pratham.org",
  },
  {
    name: "Koshish — A Family Counselling Centre",
    description:
      "Koshish works to protect the rights of prisoners and people living in institutional care across Delhi by providing legal aid, education and family reunification services.",
    location: "Burari, New Delhi",
    category: "other",
    contact: "+91 11 2756 2985",
    website: "https://koshish.net",
  },
  {
    name: "AADI — Ability, Anandita for Disabilities Integration",
    description:
      "AADI provides rehabilitation, education and training for children and adults with multiple disabilities in Delhi, enabling inclusive lives since 1981.",
    location: "Panchsheel Park, New Delhi",
    category: "health",
    contact: "+91 11 2649 3821",
    website: "https://www.aadi.org.in",
  },
  {
    name: "Greenpeace India — Delhi Hub",
    description:
      "Greenpeace India campaigns for clean air, clean energy, and forest protection. Their Delhi hub focuses on air pollution advocacy and climate action in the NCR region.",
    location: "Saket, New Delhi",
    category: "environment",
    contact: "+91 80 4112 0007",
    website: "https://www.greenpeace.org/india",
  },
  {
    name: "Bandhan — Gurugram",
    description:
      "Bandhan works with marginalized women in Gurugram and Faridabad districts, providing microfinance, skill training, and livelihood support to enable economic independence.",
    location: "Gurugram, Haryana",
    category: "women",
    contact: "+91 98183 00000",
    website: "https://www.bandhan.org.in",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // ── 1. Find or create seeder user ──────────────────────────
    let seeder = await User.findOne({ email: SEEDER_EMAIL });
    if (!seeder) {
      const hashed = await bcrypt.hash(SEEDER_PASSWORD, 10);
      seeder = await User.create({
        name:     "NGO Seeder",
        email:    SEEDER_EMAIL,
        password: hashed,
        role:     "ngo",
      });
      console.log("✅ Seeder user created:", SEEDER_EMAIL);
    } else {
      console.log("ℹ️  Seeder user already exists, reusing it");
    }

    // ── 2. Insert NGOs (skip duplicates by name) ────────────────
    let inserted = 0;
    let skipped  = 0;

    for (const data of NGO_DATA) {
      const exists = await NGO.findOne({ name: data.name });
      if (exists) {
        console.log(`⏭️  Skipped (already exists): ${data.name}`);
        skipped++;
        continue;
      }
      await NGO.create({
        ...data,
        verified:  true,
        rejected:  false,
        createdBy: seeder._id,
      });
      console.log(`✅ Inserted: ${data.name}`);
      inserted++;
    }

    console.log(`\n── Seed complete ──`);
    console.log(`   Inserted : ${inserted}`);
    console.log(`   Skipped  : ${skipped}`);
    console.log(`   Total    : ${NGO_DATA.length}`);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

seed();
