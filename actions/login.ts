"use server";

import { validateUser } from "@/util/auth";
import { prisma } from "@/util/prisma";
import { issueToken } from "@/util/token";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginRequestBody = {
  email: string;
  password: string;
};

export type Response = {
  error?: string;
};

export const login = async (
  prevState: any,
  form: FormData
): Promise<Response> => {
  const email = form.get("email") as string | null;
  const password = form.get("password") as string | null;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await validateUser(email, password);
  if (user) {
    await prisma.authUser.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });
    const token = await issueToken(user);
    cookies().set("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
    });
    redirect("/user");
  } else {
    return { error: "Invalid email or password" };
  }
};
