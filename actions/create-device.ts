"use server";

import { getAuthenticatedUser } from "@/util/get-authenticated-user";
import { prisma } from "@/util/prisma";
import { isUniqueConstraintError } from "@/util/typeguards/prisma";
import { LiteByte } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateDeviceRequestBody = {
  name: string;
  serial: string;
};

export type CreateDeviceResponse = {
  device?: LiteByte;
  error?: string;
};

export const createDevice = async (
  prevState: any,
  form: FormData
): Promise<CreateDeviceResponse> => {
  const name = form.get("name") as string | null;
  const serial = form.get("serial") as string | null;

  if (!name || !serial) {
    return { error: "Name and serial are required" };
  }

  const user = await getAuthenticatedUser();
  if (user) {
    try {
      const device = await prisma.liteByte.create({
        data: {
          name,
          serial,
          ownerId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      revalidatePath("/user/devices");
      return { device };
    } catch (e: any) {
      if (isUniqueConstraintError(e)) {
        return {
          error: "This device has already been registered to another user",
        };
      }
      // TODO: Log the error
      return { error: "An error occurred.  Please try again." };
    }
  } else {
    redirect("/login");
  }
};
