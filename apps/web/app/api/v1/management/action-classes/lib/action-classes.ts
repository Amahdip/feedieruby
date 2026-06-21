"use server";

import "server-only";
import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { TActionClass } from "@salamruby/types/action-classes";
import { ZId } from "@salamruby/types/common";
import { DatabaseError } from "@salamruby/types/errors";
import { validateInputs } from "@/lib/utils/validate";

const selectActionClass = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  description: true,
  type: true,
  key: true,
  noCodeConfig: true,
  workspaceId: true,
} satisfies Prisma.ActionClassSelect;

export const getActionClasses = reactCache(async (workspaceIds: string[]): Promise<TActionClass[]> => {
  validateInputs([workspaceIds, ZId.array()]);

  try {
    return await prisma.actionClass.findMany({
      where: {
        workspaceId: { in: workspaceIds },
      },
      select: selectActionClass,
      orderBy: {
        createdAt: "asc",
      },
    });
  } catch {
    throw new DatabaseError(`Database error when fetching actions for workspace ${workspaceIds}`);
  }
});
