import { prisma } from "@/util/prisma";
import { validateToken } from "@/util/token";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const getAuthenticatedUser = async () => {
  const token = cookies().get("token")!;
  const parsedToken = await validateToken(token.value);

  if (!parsedToken) {
    return redirect("/login");
  }

  const user = await prisma.authUser.findUnique({
    where: { email: parsedToken.sub },
    include: { LiteByte: true },
  });

  if (!user) {
    return redirect("/login");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    lastSeenAt: user.lastSeenAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    devices: user.LiteByte,
  };
};
