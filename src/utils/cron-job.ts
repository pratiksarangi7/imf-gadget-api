import cron from "node-cron";
import prismaClient from "./prisma";

cron.schedule("*/1 * * * *", async () => {
  try {
    const expirationTime = new Date(Date.now() - 60 * 10 * 1000);
    const result = await prismaClient.selfDestruct.deleteMany({
      where: {
        initiatedAt: {
          lt: expirationTime,
        },
      },
    });
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
});
