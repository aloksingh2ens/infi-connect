import { authenticate } from "../shopify.server";
import { saveShopData } from "../../src/utils/handleAppInstallation";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};
