import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LiteByte } from "@prisma/client";
import { formatDistance } from "date-fns";
import { FC } from "react";

type Props = {
  device: LiteByte;
};

export const DeviceCard: FC<Props> = ({ device }) => (
  <Card className="max-w-md flex-grow" key={device.id}>
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
  </Card>
);
