import { getUserDevice } from "@/util/get-user-device";
import { notFound } from "next/navigation";

type Params = { deviceId: string };

export default async function Page({ params }: { params: Params }) {
  const { deviceId } = params;
  const device = await getUserDevice(Number(deviceId));

  if (!device) {
    return notFound();
  }

  return (
    <div>
      <h1>{device.name}</h1>
      <p>{device.serial}</p>
    </div>
  );
}
