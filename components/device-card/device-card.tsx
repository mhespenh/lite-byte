import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LiteByte } from "@prisma/client";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { FC } from "react";
import { Button } from "../ui/button";

type Props = {
  device: LiteByte;
};

export const DeviceCard: FC<Props> = ({ device }) => (
  <Card
    className="max-w-md flex-grow flex flex-col justify-between"
    key={device.id}
  >
    <CardHeader>
      <CardTitle>{device.name}</CardTitle>
      <CardDescription>
        {device.lastContactedAt
          ? `Last seen ${formatDistance(
              device.lastContactedAt,
              new Date()
            )} ago`
          : "Never been online"}
      </CardDescription>
    </CardHeader>
    <CardContent></CardContent>
    <CardFooter>
      <Button asChild>
        <Link href={`/user/devices/${device.id}`}>View</Link>
      </Button>
    </CardFooter>
  </Card>
);
