import { cache as reactCache } from "react";
import { z } from "zod";
import { prisma } from "@salamruby/database";
import { Prisma, Workspace } from "@salamruby/database/prisma";
import { logger } from "@salamruby/logger";
import { DatabaseError } from "@salamruby/types/errors";
import { validateInputs } from "@/lib/utils/validate";

export const getWorkspaceById = reactCache(async (workspaceId: string): Promise<Workspace | null> => {
  validateInputs([workspaceId, z.cuid2()]);

  try {
    const workspacePrisma = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    return workspacePrisma;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(error, "Error fetching workspace by id");
      throw new DatabaseError(error.message);
    }
    throw error;
  }
});
