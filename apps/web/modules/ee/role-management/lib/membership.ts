import "server-only";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { PrismaErrorType } from "@salamruby/database/types/error";
import { ZString } from "@salamruby/types/common";
import { ResourceNotFoundError } from "@salamruby/types/errors";
import { TMembership, TMembershipUpdateInput, ZMembershipUpdateInput } from "@salamruby/types/memberships";
import { validateInputs } from "@/lib/utils/validate";

export const updateMembership = async (
  userId: string,
  organizationId: string,
  data: TMembershipUpdateInput
): Promise<TMembership> => {
  validateInputs([userId, ZString], [organizationId, ZString], [data, ZMembershipUpdateInput]);

  try {
    const membership = await prisma.membership.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data,
    });

    await prisma.teamUser.findMany({
      where: {
        userId,
        team: {
          organizationId,
        },
      },
      select: {
        teamId: true,
      },
    });

    if (data.role === "owner" || data.role === "manager") {
      await prisma.teamUser.updateMany({
        where: {
          userId,
          team: {
            organizationId,
          },
        },
        data: {
          role: "admin",
        },
      });
    }

    await prisma.membership.findMany({
      where: {
        organizationId,
      },
      select: {
        userId: true,
      },
    });

    return membership;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === PrismaErrorType.RecordDoesNotExist ||
        error.code === PrismaErrorType.RelatedRecordDoesNotExist)
    ) {
      throw new ResourceNotFoundError("Membership", `userId: ${userId}, organizationId: ${organizationId}`);
    }

    throw error;
  }
};
