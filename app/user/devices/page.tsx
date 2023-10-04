import { AddDeviceCard } from "@/components/add-device-card";
import { DeviceCard } from "@/components/device-card";
import { getAuthenticatedUser } from "@/util/get-authenticated-user";

export default async function Page() {
  const { devices } = await getAuthenticatedUser();

  return (
    <div className="flex gap-5 flex-wrap p-5">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
      <AddDeviceCard />
    </div>
  );
}
