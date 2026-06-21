// Minimal Prisma mock for development
// Provides only the parts used during dev to avoid DB connection errors.

export const prisma = {
  // session.findUnique returns null (no session) to bypass auth checks.
  session: {
    findUnique: async (_: any) => null,
  },
  // Add any other models as needed (e.g., account, user) with safe defaults.
  account: {
    findUnique: async (_: any) => null,
  },
  user: {
    findFirst: async (_: any) => null,
  },
  // Generic mock for $queryRaw
  $queryRaw: async (..._args: any) => [],
};
