import express from "express";
import { syncProducts } from "../controllers/productSync.controller.js";

const router = express.Router();

router.get("/sync-products", syncProducts);

export default router;
