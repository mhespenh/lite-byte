"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { FC } from "react";
import { ErrorMessage } from "../error-message";
import { Logo } from "../logo";
import { PendingServerActionButton } from "../pending-server-action-button";
import { useAddDeviceCard } from "./use-add-device-card";

export const AddDeviceCard: FC = () => {
  const { isDialogOpen, setIsDialogOpen, action, error } = useAddDeviceCard();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="max-w-md min-h-[300px] flex-grow flex justify-center items-center">
        <DialogTrigger asChild>
          <Button variant="ghost">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add a device
          </Button>
        </DialogTrigger>
      </Card>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add a device</DialogTitle>
          <DialogDescription>
            Register a new <Logo className="inline-block text-inherit" /> device
            to your account
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                required
                id="name"
                name="name"
                placeholder="Give the device a name you'll recognize"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serial" className="text-right">
                Serial Number
              </Label>
              <Input
                required
                id="serial"
                name="serial"
                placeholder="The ten-digit serial number"
                className="col-span-3"
              />
            </div>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </div>
          <DialogFooter>
            <PendingServerActionButton>Add Device</PendingServerActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
