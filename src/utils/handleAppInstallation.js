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
}
