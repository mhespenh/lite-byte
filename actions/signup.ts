"use server";

import { createUser, isCreateUserError } from "@/util/auth";
import { issueToken } from "@/util/token";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type SignupRequestBody = {
  name: string;
  email: string;
  password: string;
};

export type Response = {
  error?: string;
};

export const signup = async (
  prevState: any,
  form: FormData
): Promise<Response> => {
  const email = form.get("email") as string | null;
  const password = form.get("password") as string | null;
  const name = form.get("name") as string | null;

  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }

  const userOrError = await createUser(email, password, name);
  if (isCreateUserError(userOrError)) {
    return userOrError;
  } else {
    const token = await issueToken(userOrError);

    cookies().set("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
    });
    redirect("/user");
  }
};
