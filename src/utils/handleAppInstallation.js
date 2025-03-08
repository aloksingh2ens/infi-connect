export default async function saveShopData(session, admin) {
  try {
    const query = `
      query ShopInfo {
        shop {
          name
          contactEmail
          currencyCode
          shopOwnerName
          timezoneAbbreviation
          id
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
          billingAddress {
            address1
            address2
            city
            country
            countryCodeV2
            zip
            province
            provinceCode
          }
          primaryDomain {
            url
          }
          updatedAt
          createdAt
        }
      }
    `;

    // Execute the GraphQL query
    const response = await admin.graphql(query);

    // Parse response body using .json()
    const responseBody = await response.json();
    console.log("🛠️ Parsed response body:", JSON.stringify(responseBody, null, 2));

    // Check if the GraphQL request returned errors
    if (responseBody.errors) {
      console.error("❌ GraphQL errors:", responseBody.errors);
      throw new Error("GraphQL query failed");
    }

    // Extract the shop data
    const shopData = responseBody?.data?.shop;
    if (!shopData) {
      throw new Error("❌ Shop data is missing in the GraphQL response");
    }

    const shopDetails = {
      name: shopData.name,
      email: shopData.contactEmail || "",
      country: shopData.billingAddress?.country || "",
      country_code: shopData.billingAddress?.countryCodeV2 || "",
      currency: shopData.currencyCode,
      plan_name: shopData.plan?.displayName || "",
      shop_owner: shopData.shopOwnerName,
      timezone: shopData.timezoneAbbreviation,
      address1: shopData.billingAddress?.address1 || "",
      address2: shopData.billingAddress?.address2 || "",
      city: shopData.billingAddress?.city || "",
      zip: shopData.billingAddress?.zip || "",
      province: shopData.billingAddress?.province || "",
      province_code: shopData.billingAddress?.provinceCode || "",
      myshopify_domain: session.shop,
      shop_id: BigInt(shopData.id.replace("gid://shopify/Shop/", "")),
      accessToken: session.accessToken,
      updated_at: new Date(shopData.updatedAt),
      created_at: new Date(shopData.createdAt),
      shopify_plus: shopData.plan?.shopifyPlus || false,
      partner_development: shopData.plan?.partnerDevelopment || false,
      primary_domain_url: shopData.primaryDomain?.url || "",
    };

    await prisma.shop.upsert({
      where: { myshopify_domain: session.shop },
      update: shopDetails,
      create: shopDetails,
    });

    console.log("✅ Shop data successfully saved.");
  } catch (error) {
    console.error("❌ Error saving shop data:", error);
  }
};



// old way by using Rest API

// import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
// import prisma from "../../app/db.server";

// export const saveShopData = async (shopDomain) => {
//   try {
//     // Fetch session from Prisma
//     const session = await prisma.session.findUnique({
//       where: { shop: shopDomain },
//     });

//     if (!session) {
//       throw new Error("Session not found for the given shop.");
//     }

//     console.log("Session Found: ", session);

//     // Initialize Shopify API client
//     const shopify = shopifyApi({
//       apiKey: process.env.SHOPIFY_API_KEY,
//       apiSecretKey: process.env.SHOPIFY_API_SECRET,
//       scopes: process.env.SCOPES.split(","),
//       hostName: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
//       apiVersion: LATEST_API_VERSION,
//     });

//     const client = new shopify.clients.Rest({ session });

//     // Fetch shop data from Shopify
//     const { body } = await client.get({ path: "shop" });
//     const shopData = body.shop;
//     console.log("Fetched Shop Data:", shopData);

//     // Upsert shop data in Prisma
//     await prisma.shop.upsert({
//       where: { myshopify_domain: session.shop },
//       update: {
//         shop_id: BigInt(shopData.id),
//         name: shopData.name,
//         email: shopData.email || null,
//         country: shopData.country,
//         country_code: shopData.country_code,
//         currency: shopData.currency,
//         plan_name: shopData.plan_name,
//         shop_owner: shopData.shop_owner,
//         timezone: shopData.iana_timezone,
//         primary_locale: shopData.primary_locale,
//         address1: shopData.address1 || null,
//         address2: shopData.address2 || null,
//         city: shopData.city || null,
//         province: shopData.province || null,
//         province_code: shopData.province_code || null,
//         zip: shopData.zip || null,
//         phone: shopData.phone || null,
//         customer_email: shopData.customer_email || null,
//         has_storefront: shopData.has_storefront,
//         multi_location_enabled: shopData.multi_location_enabled,
//         password_enabled: shopData.password_enabled,
//         accessToken: session.accessToken,
//       },
//       create: {
//         myshopify_domain: session.shop,
//         shop_id: BigInt(shopData.id),
//         name: shopData.name,
//         email: shopData.email || null,
//         country: shopData.country,
//         country_code: shopData.country_code,
//         currency: shopData.currency,
//         plan_name: shopData.plan_name,
//         shop_owner: shopData.shop_owner,
//         timezone: shopData.iana_timezone,
//         primary_locale: shopData.primary_locale,
//         address1: shopData.address1 || null,
//         address2: shopData.address2 || null,
//         city: shopData.city || null,
//         province: shopData.province || null,
//         province_code: shopData.province_code || null,
//         zip: shopData.zip || null,
//         phone: shopData.phone || null,
//         customer_email: shopData.customer_email || null,
//         has_storefront: shopData.has_storefront,
//         multi_location_enabled: shopData.multi_location_enabled,
//         password_enabled: shopData.password_enabled,
//         accessToken: session.accessToken,
//       },
//     });

//     console.log("Shop data successfully saved to the database.");
//   } catch (error) {
//     console.error("Error saving shop data:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// };
