import { prisma } from "@/util/prisma";
import { validateToken } from "@/util/token";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const token = cookies().get("token");
  const authUser = await validateToken(token?.value);

  if (!authUser) {
    redirect("/login");
  }

  const user = await prisma.authUser.findFirst({
    where: {
      email: authUser.sub,
    },
    include: {
      LiteByte: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <h1>User</h1>
      {user.name} - {user.email}
    </>
  );
}
