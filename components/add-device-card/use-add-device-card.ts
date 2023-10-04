import { CreateDeviceResponse, createDevice } from "@/actions/create-device";
import { useEffect, useState } from "react";
import { experimental_useFormState as useFormState } from "react-dom";

export const useAddDeviceCard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, action] = useFormState<CreateDeviceResponse, FormData>(
    createDevice,
    {}
  );
  const { error, device } = formState;

  // Close the dialog when the device is created
  // I'm not crazy about this devex, but I can't really
  // think of a better way to do it with a server action
  // other than to have the server return a redirect
  // useFormState really needs an onComplete callback
  useEffect(() => {
    if (device?.id) {
      setIsDialogOpen(false);
    }
  }, [device?.id]);

  return {
    action,
    error,
    isDialogOpen,
    setIsDialogOpen,
  };
};
