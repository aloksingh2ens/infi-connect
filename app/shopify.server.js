import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  DeliveryMethod
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import saveShopData from "../src/utils/handleAppInstallation";

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
        await saveShopData(session, admin);

        console.log("✅ Shop Data Saved Successfully");
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
          console.log(`🚨 App uninstalled for shop: ${shop}`);
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
