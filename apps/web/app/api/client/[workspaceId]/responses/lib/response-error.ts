import { Prisma } from "@salamruby/database/prisma";
import type { PrismaClientKnownRequestError } from "@salamruby/database/prisma";
import { PrismaErrorType } from "@salamruby/database/types/error";

export const isPrismaKnownRequestError = (error: unknown): error is PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError;

export const isSingleUseIdUniqueConstraintError = (error: PrismaClientKnownRequestError): boolean => {
  if (error.code !== PrismaErrorType.UniqueConstraintViolation) {
    return false;
  }

  return Array.isArray(error.meta?.target) && error.meta.target.includes("singleUseId");
};
