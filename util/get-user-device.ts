import { getAuthenticatedUser } from "@/util/get-authenticated-user";
import { prisma } from "@/util/prisma";

/**
 * Gets a device from the database, but only if it belongs to the authenticated user
 * @param deviceId The device ID to get
 * @returns A promise that resolves to a LiteByte object if the user owns the device, otherwise null
 */
export const getUserDevice = async (deviceId: number) => {
  const user = await getAuthenticatedUser();

  const device = prisma.liteByte.findUnique({
    where: {
      id: deviceId,
      ownerId: user.id,
    },
  });

  return device;
};
