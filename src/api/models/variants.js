import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  shopifyVariantId: { type: String, unique: true, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  image: String,
  name: String,
  price: Number,
  barcode: String,
});

export const Variant = mongoose.model("Variant", VariantSchema);
