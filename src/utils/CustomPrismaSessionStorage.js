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
        },
        create: {
          id: session.id,
          shop: session.shop,
          accessToken: session.accessToken,
          scope: session.scope,
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
};

