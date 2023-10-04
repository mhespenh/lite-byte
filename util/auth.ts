import { prisma } from "@/util/prisma";
import { AuthUser } from "@prisma/client";
import { compareSync, hashSync } from "bcryptjs";
import { isUniqueConstraintError } from "./typeguards/prisma";

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
  try {
    const user = await prisma.authUser.findUnique({
      where: {
        email,
      },
    });

    if (!user) return false;
    if (!compareSync(password, user.password)) return false;

    return user;
  } catch (e) {
    return false;
  }
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
    if (isUniqueConstraintError(e)) {
      return { error: "A user with this email already exists" };
    }

    // TODO: Log the error
    return { error: "An error occurred.  Please try again." };
  }
};
