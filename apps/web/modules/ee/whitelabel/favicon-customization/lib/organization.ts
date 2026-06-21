import "server-only";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { PrismaErrorType } from "@salamruby/database/types/error";
import { ZId, ZStorageUrl } from "@salamruby/types/common";
import { ResourceNotFoundError } from "@salamruby/types/errors";
import { TOrganizationWhitelabel } from "@salamruby/types/organizations";
import { validateInputs } from "@/lib/utils/validate";

export const updateOrganizationFaviconUrl = async (
  organizationId: string,
  faviconUrl: string | null
): Promise<boolean> => {
  validateInputs([organizationId, ZId], [faviconUrl, ZStorageUrl.nullable()]);

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { whitelabel: true },
    });

    if (!organization) {
      throw new ResourceNotFoundError("Organization", organizationId);
    }

    const existingWhitelabel = (organization.whitelabel ?? {}) as TOrganizationWhitelabel;

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        whitelabel: {
          ...existingWhitelabel,
          faviconUrl,
        },
      },
    });

    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PrismaErrorType.RecordDoesNotExist
    ) {
      throw new ResourceNotFoundError("Organization", organizationId);
    }

    throw error;
  }
};
