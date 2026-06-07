import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/50 bg-white/50 shadow-postcard",
        className,
      )}
      {...props}
    />
  );
}
