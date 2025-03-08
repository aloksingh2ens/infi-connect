import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { saveShopData } from "../../src/utils/handleAppInstallation";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];


export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };

};

//  Old way REST API function call here

// export const loader = async ({ request }) => {
//   // Authenticate the Shopify admin
//   const { session } = await authenticate.admin(request);

//   if (!session) {
//     throw new Error("Shopify session not found.");
//   }

//   try {
//     // Call saveShopData to store shop info in the database
//     await saveShopData(session.shop);
//     console.log("✅ Shop data saved successfully!");
//   } catch (error) {
//     console.error("❌ Error saving shop data:", error);
//   }

//   return { apiKey: process.env.SHOPIFY_API_KEY || "" };
// };


export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
