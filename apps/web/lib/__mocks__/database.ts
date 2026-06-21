import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { PrismaClient } from "@salamruby/database/prisma";

export const prisma = mockDeep<PrismaClient>();

vi.mock("@salamruby/database", () => ({
  __esModule: true,
  prisma,
}));

beforeEach(() => {
  mockReset(prisma);
});
