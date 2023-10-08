import { FC } from "react";

type Props = {
  onChange: (color: string) => void;
  color: string;
};

const COLORS = ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f", "#fff", "#000"];

export const ColorPicker: FC<Props> = ({ color, onChange }) => (
  <div
    className="
      h-fit flex flex-col gap-3 items-center
      w-[56px]
      p-3 rounded-lg shadow-md
      relative
      bg-slate-300 dark:bg-slate-700
    "
  >
    {COLORS.map((c) => (
      <div
        key={c}
        className={`
          ${color === c ? "w-8 h-8" : "w-6 h-6"} rounded-sm
          bg-[${c}] 
          transition-all
          hover:-translate-y-[2px] active:scale-x-[0.90] active:scale-y-[0.90]
          hover:shadow-md hover:shadow-slate-500
          ${
            color === c
              ? "shadow-md shadow-slate-500 dark:border-white dark:border"
              : ""
          }
        `}
        style={{ backgroundColor: c }}
        onClick={() => onChange(c)}
      />
    ))}
  </div>
);
