import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  myshopify_domain: { type: String, required: true, unique: true },
  shop_id: { type: mongoose.Schema.Types.Decimal128, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  country: { type: String, },
  country_code: { type: String, },
  currency: { type: String, },
  plan_name: { type: String, },
  shop_owner: { type: String, },
  timezone: { type: String, },
  address1: { type: String },
  address2: { type: String },
  city: { type: String },
  zip: { type: String },
  province: { type: String },
  province_code: { type: String },
  shopify_plus: { type: Boolean, },
  partner_development: { type: Boolean, },
  primary_domain_url: { type: String },
  accessToken: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Shop = mongoose.model('Shop', shopSchema);
