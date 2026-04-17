/**
 * Seed Script — run with: node seed.js
 * Populates the DB with a sample admin user + 12 products
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");

const PRODUCTS = [
  { name: "Madhubani Village Scene", description: "A vibrant Madhubani painting depicting village life with intricate geometric patterns and nature motifs.", price: 3500, category: "Painting", artist: "Sita Devi", stock: 5, isFeatured: true, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Madhubani_painting.jpg/640px-Madhubani_painting.jpg" },
  { name: "Warli Tribal Dance", description: "Traditional Warli art on handmade paper showing tribal community dance in earthy tones.", price: 2200, category: "Painting", artist: "Ramesh Warli", stock: 8, isFeatured: true, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Warli_painting.jpg/640px-Warli_painting.jpg" },
  { name: "Blue Pottery Vase", description: "Handcrafted Jaipur blue pottery vase with traditional floral designs. Food-safe glaze.", price: 1800, category: "Pottery", artist: "Gopal Kumhar", stock: 12, isFeatured: false },
  { name: "Terracotta Horse", description: "A classic terracotta horse sculpture from Bankura, West Bengal. Hand-painted in natural earth tones.", price: 950, category: "Sculpture", artist: "Kartik Pal", stock: 20, isFeatured: true },
  { name: "Phulkari Dupatta", description: "Hand-embroidered Phulkari dupatta from Punjab with intricate floral threadwork on cotton.", price: 2800, category: "Textile", artist: "Gurpreet Kaur", stock: 6 },
  { name: "Silver Filigree Earrings", description: "Delicate Odisha silver filigree earrings crafted by master artisans. Hypoallergenic silver.", price: 1200, category: "Jewelry", artist: "Bijay Mohanty", stock: 15, isFeatured: true },
  { name: "Pattachitra Vishnu", description: "Traditional Odisha Pattachitra painting of Lord Vishnu on cloth with natural colors and intricate borders.", price: 4500, category: "Painting", artist: "Apindra Swain", stock: 3 },
  { name: "Dhokra Bell Pendant", description: "Lost-wax cast Dhokra brass pendant with tribal motifs. Each piece is unique and handmade.", price: 650, category: "Jewelry", artist: "Sukra Gond", stock: 30 },
  { name: "Manipuri Pot", description: "Handmade black pottery from Manipur using the traditional Longpi technique. Oven-safe.", price: 2100, category: "Pottery", artist: "Tombi Devi", stock: 9 },
  { name: "Digital Mandala Print", description: "High-resolution digital art mandala, available as a premium print on archival paper. A4 size.", price: 800, category: "Digital Art", artist: "Priya Sharma", stock: 50 },
  { name: "Channapatna Wooden Toys", description: "Set of 5 traditional Channapatna lacquered wooden toys — safe for children, made with natural dyes.", price: 1500, category: "Sculpture", artist: "Muniraju M", stock: 18 },
  { name: "Kashmiri Pashmina Shawl", description: "Handwoven pure Pashmina shawl with Kani weave border. Warm, lightweight, and luxurious.", price: 8500, category: "Textile", artist: "Abdul Rashid Bhat", stock: 4, isFeatured: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@chitrakaarcrafts.com",
      password: "admin123",
      role: "admin",
    });
    console.log(`👤 Admin created: ${admin.email} / admin123`);

    // Create regular user
    const user = await User.create({
      name: "Test User",
      email: "user@chitrakaarcrafts.com",
      password: "user1234",
      role: "user",
    });
    console.log(`👤 User created: ${user.email} / user1234`);

    // Seed products
    const products = await Product.insertMany(PRODUCTS);
    console.log(`🎨 ${products.length} products seeded`);

    console.log("\n✅ Seeding complete!");
    console.log("─────────────────────────────────");
    console.log("Admin →  admin@chitrakaarcrafts.com / admin123");
    console.log("User  →  user@chitrakaarcrafts.com / user1234");
    console.log("─────────────────────────────────\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();