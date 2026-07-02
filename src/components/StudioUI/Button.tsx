import type { ButtonHTMLAttributes, ReactNode } from "react";
import { studioClassNames } from "../../constants/design";
import { cx } from "./classNames";

export type StudioButtonVariant = "danger" | "primary" | "secondary" | "solid";

export type StudioButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  variant?: StudioButtonVariant;
};

const variantClassNames: Record<StudioButtonVariant, string> = {
  danger:
    "border border-red-300/35 bg-red-500/15 text-red-50 hover:border-red-200/60 hover:bg-red-500/25 active:bg-red-500/30",
  primary:
    "border border-cyan-200/70 bg-cyan-300 text-neutral-950 hover:bg-cyan-200 active:bg-cyan-100",
  secondary:
    "border border-white/15 bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.07] active:bg-white/10",
  solid:
    "border border-transparent bg-white text-neutral-950 hover:bg-neutral-200 active:bg-neutral-300",
};

export function Button({
  children,
  className,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  type = "button",
  variant = "secondary",
  ...buttonProps
}: StudioButtonProps) {
  return (
    <button
      {...buttonProps}
      className={cx(
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-md px-3.5 py-2.5 text-center text-sm font-semibold leading-tight",
        studioClassNames.touchTarget,
        studioClassNames.motion,
        studioClassNames.focusRing,
        studioClassNames.disabled,
        variantClassNames[variant],
        fullWidth && "w-full",
        className,
      )}
      type={type}
    >
      {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
      <span className="min-w-0">{children}</span>
      {trailingIcon ? <span aria-hidden="true">{trailingIcon}</span> : null}
    </button>
  );
}

export function PrimaryButton(props: Omit<StudioButtonProps, "variant">) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<StudioButtonProps, "variant">) {
  return <Button {...props} variant="secondary" />;
}

export function DangerButton(props: Omit<StudioButtonProps, "variant">) {
  return <Button {...props} variant="danger" />;
}
