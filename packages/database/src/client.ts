import { PrismaClient } from "./prisma";
import { createPrismaPgAdapter } from "./prisma-adapter";

const prismaClientSingleton = (): PrismaClient => {
  const { adapter } = createPrismaPgAdapter();
  return new PrismaClient({
    adapter,
    ...(process.env.DEBUG === "1" && { log: ["query", "info"] }),
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
