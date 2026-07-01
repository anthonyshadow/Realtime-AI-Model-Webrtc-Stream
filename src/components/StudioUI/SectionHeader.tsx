import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./classNames";

export type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  title: string;
};

export function SectionHeader({
  actions,
  className,
  description,
  eyebrow,
  headingLevel = 3,
  title,
  ...props
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <div {...props} className={cx("min-w-0", className)}>
      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase text-cyan-100/70">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex min-w-0 items-start justify-between gap-3">
        <Heading className="min-w-0 truncate text-sm font-semibold text-white">
          {title}
        </Heading>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {description ? (
        <p className="mt-0.5 text-xs leading-5 text-neutral-400">{description}</p>
      ) : null}
    </div>
  );
}
