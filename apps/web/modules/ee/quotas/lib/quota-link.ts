import "server-only";
import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { ZId } from "@salamruby/types/common";
import { DatabaseError } from "@salamruby/types/errors";
import { validateInputs } from "@/lib/utils/validate";

export const getQuotaLinkCountByQuotaId = reactCache(async (quotaId: string): Promise<number> => {
  try {
    validateInputs([quotaId, ZId]);

    const quotaLinkCount = await prisma.responseQuotaLink.count({
      where: {
        quotaId,
        status: "screenedIn",
      },
    });

    return quotaLinkCount;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
});
