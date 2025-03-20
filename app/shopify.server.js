import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  DeliveryMethod
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
    hooks: {
      afterAuth: async ({ session, admin }) => {
        try {
          console.log("✅ afterAuth Hook Triggered");
  
          // Register necessary webhooks
          await shopify.registerWebhooks({ session });
  
          // Fetch and save shop data via GraphQL
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
  
          const response = await admin.graphql(query);
          const responseBody = await response.json();
  
          console.log("🛠️ Parsed response body:", JSON.stringify(responseBody, null, 2));
  
          if (responseBody.errors) {
            console.error("❌ GraphQL errors:", responseBody.errors);
            throw new Error("GraphQL query failed");
          }
  
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
  
          await prisma.shops.upsert({
            where: { myshopify_domain: session.shop },
            update: shopDetails,
            create: shopDetails,
          });
  
          console.log("✅ Shop data successfully saved.");
        } catch (error) {
          console.error("❌ Error in afterAuth Hook:", error);
        }
      },
    },
  
    webhooks: {
      APP_UNINSTALLED: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/webhooks/app_uninstalled",
        callback: async (topic, shop, body) => {
          await prisma.shop.delete({
            where: { myshopify_domain: shop },
          });
        },
      },
    },
  
});


export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
