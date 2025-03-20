import express from 'express';
import { checkShops, getProducts } from '../controllers/shopController.js';

const router = express.Router();

// router.get('/check-shop/:shopName', checkShop);
router.get("/check-shop", checkShops);
router.get("/get-products", getProducts)

export default router;