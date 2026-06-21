import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { DatabaseError } from "@salamruby/types/errors";
import { TOrganizationWorkspace } from "@/modules/organization/settings/api-keys/types/api-keys";

export const getWorkspacesByOrganizationId = reactCache(
  async (organizationId: string): Promise<TOrganizationWorkspace[]> => {
    try {
      const workspaces = await prisma.workspace.findMany({
        where: {
          organizationId,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return workspaces;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DatabaseError(error.message);
      }

      throw error;
    }
  }
);
