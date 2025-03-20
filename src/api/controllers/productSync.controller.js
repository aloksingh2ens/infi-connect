import axios from "axios";
import { Product } from "../models/product.js";
import { Variant } from "../models/variants.js";
import prisma from "../../../app/db.server.js";

const fetchShopifyProducts = async (shop, accessToken) => {
  try {
    if (!shop || !accessToken) {
      throw new Error("Shop domain and access token are required.");
    }

    const shopifyGraphQLUrl = `https://${shop}/admin/api/2024-01/graphql.json`;

    const query = `
      {
        products(first: 250) {
          edges {
            node {
              id
              title
              status
              productType
              createdAt
              updatedAt
              vendor
              tags
              images(first: 10) {
                edges {
                  node {
                    src
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    barcode
                    image {
                      src
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      shopifyGraphQLUrl,
      { query },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      },
    );

    if (
      !response.data ||
      !response.data.data ||
      !response.data.data.products ||
      !response.data.data.products.edges
    ) {
      throw new Error("Invalid response format from Shopify.");
    }

    return response.data.data.products.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("Error fetching products from Shopify:", error.message);
    return [];
  }
};

const saveProductsToDB = async (shop, products) => {
  try {
    if (!Array.isArray(products) || products.length === 0) {
      console.warn("No products found to save.");
      return;
    }

    let newlySynced = 0;
    let alreadySynced = 0;

    for (const product of products) {
      if (!product.id || !product.title) {
        console.warn("Skipping product with missing ID or title:", product);
        continue;
      }

      const extractNumericId = (shopifyId) => shopifyId.split('/').pop(); 
      const productNumericId = extractNumericId(product.id);

      const existingProduct = await Product.findOne({ shopifyId: product.id });

      if (!existingProduct) {
        const newProduct = await Product.create({
          shopifyId: productNumericId,
          title: product.title,
          status: product.status || "unknown",
          productType: product.productType || "N/A",
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
          vendorId: product.vendor || "unknown",
          vendorName: product.vendor || "unknown",
          tags: Array.isArray(product.tags) ? product.tags : [],
          images: product.images?.edges?.map((img) => img.node.src) || [],
        });

        if (Array.isArray(product.variants.edges)) {
          for (const variant of product.variants.edges) {
            if (!variant.node.id || !variant.node.title || !variant.node.price) {
              console.warn("Skipping variant with missing required fields:", variant);
              continue;
            }

            await Variant.create({
              shopifyVariantId: extractNumericId(variant.node.id),
              productId: newProduct._id,
              image: variant.node.image ? variant.node.image.src : null,
              name: variant.node.title,
              price: parseFloat(variant.node.price),
              barcode: variant.node.barcode || null,
            });
          }
          newlySynced++;
        } else {
          alreadySynced++;
        }
      }
    }
    return { newlySynced, alreadySynced };
  } catch (error) {
    console.error("Error saving products to DB:", error.message);
    throw new Error("Failed to save products to DB.");
  }
};

// API for Admin to Sync Products
export const syncProducts = async (req, res) => {
  try {
    const { shop } = req.query;

    if (!shop || typeof shop !== "string" || !shop.includes(".myshopify.com")) {
      return res.status(400).json({ error: "Invalid or missing shop domain." });
    }

    const shopData = await prisma.shops.findUnique({
      where: { myshopify_domain: shop },
    });

    if (!shopData) {
      return res.status(404).json({ error: "Shop not found in the database." });
    }

    if (!shopData.accessToken) {
      return res.status(403).json({ error: "Access token is missing for this shop." });
    }

    const accessToken = shopData.accessToken;
    const products = await fetchShopifyProducts(shop, accessToken);

    if (products.length === 0) {
      return res.status(200).json({ message: "No new products found to sync." });
    }

    const { newlySynced, alreadySynced } = await saveProductsToDB(shop, products);

    return res.json({
      message: `Product sync completed. Newly synced: ${newlySynced}, Already synced: ${alreadySynced}`,
    });
  } catch (error) {
    console.error("Error syncing products:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
