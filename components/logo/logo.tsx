import { cn } from "@/util/shadcn";
import { FC } from "react";
import styles from "./logo.module.css";

type Props = {
  className?: string;
};

export const Logo: FC<Props> = ({ className }) => (
  <span className={cn(styles.logo, className)}>LITE-BYTE</span>
);
