import { Session } from "@shopify/shopify-api";
import prisma from "../../app/db.server";

export class CustomPrismaSessionStorage {
  async storeSession(session, shopData) {
    try {
      await prisma.session.upsert({
        where: { id: session.id },
        update: {
          shop: session.shop,
          accessToken: session.accessToken,
          scope: session.scope,
          shopName: shopData?.name,
          email: shopData?.email,
          country: shopData?.country,
          currency: shopData?.currency,
          timezone: shopData?.timezone,
          shopOwner: shopData?.shop_owner,
          planName: shopData?.plan_name,
          createdAt: new Date(shopData?.created_at),
          updatedAt: new Date(shopData?.updated_at),
          primaryLocationId: BigInt(shopData?.primary_location_id || 0),
          domain: shopData?.domain,
        },
        create: {
          id: session.id,
          shop: session.shop,
          accessToken: session.accessToken,
          scope: session.scope,
          shopName: shopData?.name,
          email: shopData?.email,
          country: shopData?.country,
          currency: shopData?.currency,
          timezone: shopData?.timezone,
          shopOwner: shopData?.shop_owner,
          planName: shopData?.plan_name,
          createdAt: new Date(shopData?.created_at),
          updatedAt: new Date(shopData?.updated_at),
          primaryLocationId: BigInt(shopData?.primary_location_id || 0),
          domain: shopData?.domain,
        },
      });

      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  }

  async loadSession(id) {
    try {
      const storedSession = await prisma.session.findUnique({ where: { id } });
      if (!storedSession) return undefined;

      return new Session({
        id: storedSession.id,
        shop: storedSession.shop,
        accessToken: storedSession.accessToken,
        scope: storedSession.scope,
      });
    } catch (error) {
      console.error("Error loading session:", error);
      return undefined;
    }
  }

  async deleteSession(id) {
    try {
      await prisma.session.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  }
}

