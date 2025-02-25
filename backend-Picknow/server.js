import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./database/db.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/ProductRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoute.js";
import comboRoutes from "./routes/comboRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directories if they don't exist
const categoryUploadDir = path.join(__dirname, 'uploads', 'category');
const subcategoryUploadDir = path.join(__dirname, 'uploads', 'subcategory');

if (!fs.existsSync(categoryUploadDir)) {
  fs.mkdirSync(categoryUploadDir, { recursive: true });
}
if (!fs.existsSync(subcategoryUploadDir)) {
  fs.mkdirSync(subcategoryUploadDir, { recursive: true });
}

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS with proper configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"], // Shop and admin ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON requests
app.use(express.json());

// Configure static file serving
// This will serve files from the 'uploads' directory when requested through /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);     // Mount vendor routes under /api/vendor
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);
app.use("/api", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api", comboRoutes);

// Start server
app.listen(port, async () => {
    try {
        await connectdb();
        console.log(`Server running on http://localhost:${port}`);
    } catch (error) {
        console.error("Database connection error:", error);
    }
});
