"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { FC } from "react";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

type Props = ButtonProps;

export const PendingServerActionButton: FC<Props> = ({
  children,
  className,
}) => {
  const { pending } = useFormStatus();

  return (
    <Button className={className} disabled={pending}>
      {children}
    </Button>
  );
};
