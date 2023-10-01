import { prisma } from "@/util/prisma";
import { AuthUser, Prisma } from "@prisma/client";
import { compareSync, hashSync } from "bcryptjs";

type CreateUserError = {
  error: string;
};

/**
 * Given an email and password, validate the user
 * @param email The email of the user to validate
 * @param password The unhashed password of the user to validate
 * @returns The AuthUser object if the user is valid, false otherwise
 */
export const validateUser = async (email: string, password: string) => {
  const user = await prisma.authUser.findUnique({
    where: {
      email,
    },
  });

  if (!user) return false;
  if (!compareSync(password, user.password)) return false;

  return user;
};

export const isCreateUserError = (
  userOrError: AuthUser | CreateUserError
): userOrError is CreateUserError =>
  (userOrError as CreateUserError).error !== undefined;

export const createUser = async (
  email: string,
  password: string,
  name: string
): Promise<AuthUser | CreateUserError> => {
  const hashedPassword = hashSync(password, 12);
  try {
    const user = await prisma.authUser.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    return user;
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return { error: "A user with this email already exists" };
      }
    }
    return { error: e.message };
  }
};
