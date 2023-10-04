import { Prisma } from "@prisma/client";

// Prisma Error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
const ERROR_UNIQUE_CONSTRAINT_FAIILED = "P2002";

export const isUniqueConstraintError = (
  error: Error
): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === ERROR_UNIQUE_CONSTRAINT_FAIILED;
