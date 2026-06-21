import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { ZString } from "@salamruby/types/common";
import { DatabaseError, ResourceNotFoundError } from "@salamruby/types/errors";
import { validateInputs } from "@/lib/utils/validate";

export const getOrganizationsByUserId = reactCache(
  async (userId: string): Promise<{ id: string; name: string }[]> => {
    validateInputs([userId, ZString]);

    try {
      const organizations = await prisma.organization.findMany({
        where: {
          memberships: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (!organizations) {
        throw new ResourceNotFoundError("Organizations by UserId", userId);
      }
      return organizations;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DatabaseError(error.message);
      }

      throw error;
    }
  }
);
