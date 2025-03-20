import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  shopifyId: { type: String, unique: true, required: true },
  title: String,
  status: String,
  barcode: String,
  productType: String,
  createdAt: Date,
  updatedAt: Date,
  vendorId: String,
  vendorName: String,
  vendorObjectId: mongoose.Schema.Types.ObjectId,
  tags: [String],
  images: [String],
});

export const Product = mongoose.model("Product", ProductSchema);
