import express from "express";
import mongoose from "mongoose";
import shopRoutes from "./routes/shopRoutes.js";
import productSyncRoutes from "./routes/productRoutes.js"
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json()); 
// Configure CORS properly
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://cms:cms@cluster0.xuyxuzx.mongodb.net/infi-connect?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", shopRoutes);
app.use("/api", productSyncRoutes);

// Global Error Handler (for better error responses)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
