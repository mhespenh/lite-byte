import { prisma } from "@/util/prisma";

export async function PATCH(request: Request) {
  const { serial } = (await request.json()) as { serial: string };

  if (!serial) {
    return new Response("Missing serial", { status: 400 });
  }

  try {
    await prisma.liteByte.update({
      where: { serial },
      data: { lastContactedAt: new Date() },
    });
    return new Response("OK", { status: 200 });
  } catch (error: any) {
    // code P2025 is Prisma for "not found"
    if (error.code === "P2025") {
      return new Response("Device not found", { status: 404 });
    }

    return new Response("Unknown error occurred", { status: 500 });
  }
}
