import type { HTMLAttributes } from "react";
import { studioClassNames } from "../../constants/design";
import { cx } from "./classNames";

export type SurfacePadding = "lg" | "md" | "none" | "sm";
export type SurfaceVariant = "card" | "panel" | "sheet";

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  padding?: SurfacePadding;
  variant?: SurfaceVariant;
};

const paddingClassNames: Record<SurfacePadding, string> = {
  lg: "p-5",
  md: "p-4",
  none: "p-0",
  sm: "p-3",
};

const variantClassNames: Record<SurfaceVariant, string> = {
  card: "rounded-md border border-white/10 bg-black/25 text-white",
  panel: `rounded-lg ${studioClassNames.surface}`,
  sheet: `rounded-t-2xl border border-white/15 bg-neutral-950/86 text-white shadow-[0_-18px_60px_rgb(0_0_0/0.42)] backdrop-blur-xl sm:rounded-2xl`,
};

export function Surface({
  children,
  className,
  padding = "md",
  variant = "panel",
  ...props
}: SurfaceProps) {
  return (
    <div
      {...props}
      className={cx(variantClassNames[variant], paddingClassNames[padding], className)}
    >
      {children}
    </div>
  );
}

export function Card(props: Omit<SurfaceProps, "variant">) {
  return <Surface {...props} variant="card" />;
}
