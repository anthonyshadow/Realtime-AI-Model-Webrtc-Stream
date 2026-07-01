import type { ReactNode } from "react";
import { studioClassNames } from "../../constants/design";
import { cx } from "./classNames";

export type ErrorBannerAction = {
  label: string;
  onClick: () => void;
  variant?: "danger" | "primary" | "secondary";
};

export type ErrorBannerProps = {
  actions?: ErrorBannerAction[];
  children?: ReactNode;
  className?: string;
  message: string;
  title: string;
};

const actionClassNames: Record<NonNullable<ErrorBannerAction["variant"]>, string> = {
  danger:
    "border-red-200/45 bg-red-500/20 text-red-50 hover:border-red-100/70 hover:bg-red-500/30",
  primary:
    "border-cyan-200/70 bg-cyan-300 text-neutral-950 hover:bg-cyan-200",
  secondary:
    "border-white/15 bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.07]",
};

export function ErrorBanner({
  actions = [],
  children,
  className,
  message,
  title,
}: ErrorBannerProps) {
  return (
    <div
      className={cx(
        "rounded-lg border border-red-300/30 bg-red-500/15 p-3 text-red-50",
        className,
      )}
      role="alert"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-red-50/85">{message}</p>
        {children ? <div className="mt-2 text-xs leading-5 text-red-50/75">{children}</div> : null}
      </div>
      {actions.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 gap-2 min-[420px]:flex min-[420px]:flex-wrap">
          {actions.map((action) => (
            <button
              key={action.label}
              className={cx(
                "inline-flex min-h-10 min-w-0 items-center justify-center rounded-md border px-3 py-2 text-center text-xs font-semibold leading-tight",
                studioClassNames.motion,
                studioClassNames.focusRing,
                actionClassNames[action.variant ?? "secondary"],
              )}
              type="button"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
