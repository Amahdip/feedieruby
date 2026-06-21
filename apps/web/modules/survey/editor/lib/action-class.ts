import { prisma } from "@salamruby/database";
import { ActionClass, Prisma } from "@salamruby/database/prisma";
import { PrismaErrorType } from "@salamruby/database/types/error";
import { TActionClassInput } from "@salamruby/types/action-classes";
import { DatabaseError, UniqueConstraintError } from "@salamruby/types/errors";

export const createActionClass = async (
  workspaceId: string,
  actionClass: TActionClassInput
): Promise<ActionClass> => {
  const { workspaceId: _, ...actionClassInput } = actionClass;

  try {
    const actionClassPrisma = await prisma.actionClass.create({
      data: {
        ...actionClassInput,
        workspace: { connect: { id: workspaceId } },
        key: actionClassInput.type === "code" ? actionClassInput.key : undefined,
        noCodeConfig:
          actionClassInput.type === "noCode"
            ? actionClassInput.noCodeConfig === null
              ? undefined
              : actionClassInput.noCodeConfig
            : undefined,
      },
    });

    return actionClassPrisma;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PrismaErrorType.UniqueConstraintViolation
    ) {
      const targetField = (error.meta?.target as string[] | undefined)?.[0];
      throw new UniqueConstraintError(
        `Action with ${targetField} ${targetField ? (actionClass as Record<string, unknown>)[targetField] : ""} already exists`
      );
    }

    throw new DatabaseError(`Database error when creating an action for workspace ${workspaceId}`);
  }
};
