import prisma from "../../../app/db.server.js";
import { Shop } from "../models/shop.js";
import axios from "axios";


// export const checkShop = async (req, res) => {
//     try {
//       const { shopName } = req.params;

//       const myshopify_domain = `${shopName}.myshopify.com`;
//       const shop = await Shop.findOne({ myshopify_domain });

//       if (shop && shop.shop_id && shop.name && shop.email) {
//         const shopName = myshopify_domain.replace(".myshopify.com", "");

//       return res.status(200).json({
//         showButton: true,
//         message: "Shop found",
//         shopName,
//       });
//       }

//       return res.status(404).json({ showButton: false, message: 'Please register yourself' });
//     } catch (error) {
//       return res.status(500).json({ error: 'Internal Server Error', details: error.message });
//     }
// };

// export const checkShops = async (req, res) => {
//   try {
//       const { shop } = req.query;

//       // Validate shop query parameter
//       if (!shop) {
//           return res.status(400).json({ showButton: false, message: "Shop domain is required" });
//       }

//       // Check shop existence
//       const shopData = await Shop.findOne({ myshopify_domain: shop });

//       if (!shopData) {
//           return res.status(404).json({ showButton: false, message: "Please register yourself" });
//       }

//       if (shopData.shop_id && shopData.name && shopData.email) {
//           return res.status(200).json({ showButton: true, message: "Shop found" });
//       }

//       return res.status(400).json({ showButton: false, message: "Incomplete shop data" });
//   } catch (error) {
//       console.error("Error in checkShops API:", error);
//       return res.status(500).json({ showButton: false, error: "Internal Server Error", details: error.message });
//   }
// };

export const checkShops = async (req, res) => {
  try {
    const { shop } = req.query;

    if (!shop) {
      return res
        .status(400)
        .json({ showButton: false, message: "Shop domain is required" });
    }

    const shopData = await prisma.shops.findUnique({
      where: { myshopify_domain: shop },
    });

    if (!shopData) {
      return res
        .status(404)
        .json({ showButton: false, message: "Please register yourself" });
    }

    if (shopData.shop_id && shopData.name && shopData.email) {
      return res.status(200).json({ showButton: true, message: "Shop found" });
    }

    return res
      .status(400)
      .json({ showButton: false, message: "Incomplete shop data" });
  } catch (error) {
    console.error("Error in checkShops API:", error);
    return res.status(500).json({
      showButton: false,
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// export const getProducts = async (req, res) => {
//   try {
//     const { shop, first = 10, after } = req.query;
//     if (!shop) {
//       return res.status(400).json({ error: "shopDomain is required" });
//     }

//     const shopData = await prisma.shops.findUnique({
//       where: { myshopify_domain: shop },
//     });

//     if (!shopData) {
//       return res.status(404).json({ error: "Shop not found" });
//     }

//     const accessToken = shopData.accessToken;

//     const shopifyGraphQLUrl = `https://${shop}/admin/api/2024-01/graphql.json`;

//     // GraphQL Query to Fetch Products
//     const query = `
//       query getAllProducts($first: Int!, $after: String) {
//           products(first: $first, after: $after) {
//               edges {
//                   node {
//                       id
//                       title
//                       handle
//                   }
//               }
//               pageInfo {
//                   hasNextPage
//                   endCursor
//               }
//           }
//       }
//     `;

//     const variables = { first: parseInt(first) };
//     if (after) variables.after = after;

//     // Shopify GraphQL Request
//     const response = await axios.post(
//         shopifyGraphQLUrl,
//         { query, variables },
//         {
//             headers: {
//                 'X-Shopify-Access-Token': accessToken,
//                 'Content-Type': 'application/json'
//             }
//         }
//     );

//     return res.json(response.data);

//   } catch (error) {
//     console.error("Error fetching products:", error.message);
//     return res
//       .status(500)
//       .json({ error: "Internal Server Error", details: error.message });
//   }
// };

// cursor-based pagination
// export const getProducts = async (req, res) => {
//   try {
//     const { shop, first = 10 } = req.query;
//     if (!shop) {
//       return res.status(400).json({ error: "shopDomain is required" });
//     }

//     const shopData = await prisma.shops.findUnique({
//       where: { myshopify_domain: shop },
//     });

//     if (!shopData) {
//       return res.status(404).json({ error: "Shop not found" });
//     }

//     const accessToken = shopData.accessToken;
//     const shopifyGraphQLUrl = `https://${shop}/admin/api/2024-01/graphql.json`;

//     let allProducts = [];
//     let hasNextPage = true;
//     let endCursor = null;
//     let totalPages = 0;

//     // Function to fetch a single page of products
//     const fetchProducts = async (cursor = null) => {
//       const query = `
//         query getAllProducts($first: Int!, $after: String) {
//             products(first: $first, after: $after) {
//                 edges {
//                     node {
//                         id
//                         title
//                         handle
//                     }
//                 }
//                 pageInfo {
//                     hasNextPage
//                     endCursor
//                 }
//             }
//         }
//       `;

//       const variables = { first: parseInt(first) };
//       if (cursor) variables.after = cursor;

//       const response = await axios.post(
//         shopifyGraphQLUrl,
//         { query, variables },
//         {
//           headers: {
//             'X-Shopify-Access-Token': accessToken,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       return response.data.data.products;
//     };

//     // Fetch first page
//     let products = await fetchProducts();
//     while (hasNextPage) {
//       for (let i = 0; i < products.edges.length; i++) {
//         allProducts.push(products.edges[i].node);
//       }

//       hasNextPage = products.pageInfo.hasNextPage;
//       endCursor = products.pageInfo.endCursor;
//       totalPages++;

//       if (hasNextPage) {
//         products = await fetchProducts(endCursor);
//       }
//     }

//     return res.json({
//       totalProducts: allProducts.length,
//       totalPages,
//       products: allProducts,
//     });

//   } catch (error) {
//     console.error("Error fetching products:", error.message);
//     return res.status(500).json({
//       error: "Internal Server Error",
//       details: error.message
//     });
//   }
// };

export const getProducts = async (req, res) => {
  try {
    const { shop, page = 1, limit = 10 } = req.query;

    if (!shop) {
      return res.status(400).json({ error: "shopDomain is required" });
    }

    const shopData = await prisma.shops.findUnique({
      where: { myshopify_domain: shop },
    });

    if (!shopData) {
      return res.status(404).json({ error: "Shop not found" });
    }

    const accessToken = shopData.accessToken;
    const shopifyGraphQLUrl = `https://${shop}/admin/api/2024-01/graphql.json`;

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    // Step 1: Get total product count
    const countQuery = `
      {
        productsCount {
          count
        }
      }
    `;

    const countResponse = await axios.post(
      shopifyGraphQLUrl,
      { query: countQuery },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      },
    );

    if (
      !countResponse.data ||
      !countResponse.data.data ||
      !countResponse.data.data.productsCount ||
      !countResponse.data.data.productsCount.count === "undefined"
    ) {
      return res
        .status(500)
        .json({ error: "Failed to fetch total product count" });
    }

    const totalProducts = countResponse.data.data.productsCount.count;
    const totalPages = Math.ceil(totalProducts / pageSize);

    if (pageNumber > totalPages) {
      return res.status(404).json({ error: "Page number exceeds total pages" });
    }

    // Step 2: Fetch the correct cursor for the requested page
    let cursor = null;
    if (pageNumber > 1) {
      const prevPageVariables = { first: (pageNumber - 1) * pageSize };

      const prevResponse = await axios.post(
        shopifyGraphQLUrl,
        {
          query: `
            query getCursor($first: Int!) {
              products(first: $first) {
                edges {
                  cursor
                }
              }
            }
          `,
          variables: prevPageVariables,
        },
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        },
      );

      const prevEdges = prevResponse.data.data.products.edges;
      if (prevEdges.length > 0) {
        cursor = prevEdges[prevEdges.length - 1].cursor;
      }
    }

    // Step 3: Fetch paginated products with correct cursor
    const productQuery = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              handle
              status
              productType
              totalInventory
              tracksInventory
              vendor
              publishedAt
              variantsCount {
                count
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables = { first: pageSize, after: cursor };

    const response = await axios.post(
      shopifyGraphQLUrl,
      { query: productQuery, variables },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.data || !response.data.data || !response.data.data.products) {
      return res
        .status(500)
        .json({ error: "Shopify API did not return product data" });
    }

    const products = response.data.data.products.edges.map((edge) => edge.node);
    const hasNextPage = response.data.data.products.pageInfo.hasNextPage;
    const nextCursor = response.data.data.products.pageInfo.endCursor;

    return res.json({
      totalProducts,
      totalPages,
      currentPage: pageNumber,
      limit: pageSize,
      hasNextPage,
      nextCursor,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
