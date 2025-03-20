// import { useLoaderData } from "@remix-run/react";
// import { useEffect, useState } from "react";

// export const loader = async ({ request }) => {
//     const url = new URL(request.url);
//     const shop = url.searchParams.get("shop");

//     if (!shop) {
//         return { showButton: false, message: "Shop domain is required. Please register." };
//     }

//     try {
//         const response = await fetch(`https://084a-103-206-131-194.ngrok-free.app/api/check-shop?shop=${shop}`);
//         if (!response.ok) {
//             throw new Error("Failed to fetch shop data");
//         }

//         const data = await response.json();
//         return {
//             shop,
//             showButton: data.showButton ?? false,
//             message: data.message ?? "Please register yourself.",
//         };
//     } catch (error) {
//         console.error("Error fetching shop data:", error.message);
//         return { showButton: false, message: "Internal Server Error. Please try again later." };
//     }
// };

// export default function Index() {
//     const { shop, showButton: initialShowButton, message: initialMessage } = useLoaderData();
//     const [showButton, setShowButton] = useState(initialShowButton);
//     const [message, setMessage] = useState(initialMessage);

//     // Polling to check shop status after installation
//     useEffect(() => {
//         if (shop && !initialShowButton) {
//             const interval = setInterval(async () => {
//                 try {
//                     const response = await fetch(`/api/check-shop?shop=${shop}`);

//                     if (!response.ok) {
//                         console.warn("Polling response not OK:", response.status);
//                         return;
//                     }

//                     const data = await response.json();

//                     if (data.showButton) {
//                         setShowButton(true);
//                         setMessage(data.message);
//                         clearInterval(interval); // Stop polling once data is found
//                     }
//                 } catch (error) {
//                     console.error("Polling error:", error.message);
//                 }
//             }, 3000); // Check every 3 seconds

//             return () => clearInterval(interval);
//         }
//     }, [shop, initialShowButton]);

//     const handleRedirect = () => {
//         const redirectUrl = `https://inficonnect.fixall.ai/`;
//         window.location.assign(redirectUrl);
//     };

//     return (
//         <div>
//             {showButton ? (
//                 <button className="btn-primary" onClick={handleRedirect}>
//                     Get Started
//                 </button>
//             ) : (
//                 <div>
//                     <h2>Remix app template</h2>
//                     <p>{message}</p>
//                 </div>
//             )}
//         </div>
//     );
// }


import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import axios from "axios";
import { useLoaderData } from "@remix-run/react";
import {json} from '@remix-run/node'





export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop
  });
};


export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};



export default function Index() {

const {shop} = useLoaderData();
const [showbutton,setshowbutton] = useState();

  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  const abc = () => {
    window.location.href = "https://inficonnect.fixall.ai";
  }

  const getstatus = async () => {
    try {
      const response = await axios.get(`https://shop-check.onrender.com/api/check-shop?shop=${shop}`, {
        headers: {
          "Content-Type": "application/json",
        }
      });
      // console.log(response,"line 129")
      setshowbutton(response.data.showButton)
    } catch (error) {
      console.error("API call failed:", error);
      setshowbutton(error.response.data.showButton)
    }
  }
  useEffect(() => {
    getstatus()
  }, [])
  return (

    <Page>
      
      <TitleBar title="">
        {showbutton === true ? <button variant="primary" onClick={abc}>
          infiConnect
        </button> : null}
      </TitleBar>

    </Page>
  );
}

