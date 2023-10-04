import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { FC, ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode | string;
  className?: string;
};
export const ErrorMessage: FC<Props> = ({
  title = "Error",
  className,
  children,
}) => (
  <Alert variant="destructive" className={className}>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{children}</AlertDescription>
  </Alert>
);
