import { useId, type ReactNode } from "react";

type ControlPanelSectionProps = {
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function ControlPanelSection({
  children,
  description,
  eyebrow,
  title,
}: ControlPanelSectionProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0"
    >
      <div className="mb-2">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase text-cyan-100/70">
            {eyebrow}
          </p>
        ) : null}
        <h3 id={headingId} className="text-sm font-semibold text-white">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-5 text-neutral-400">{description}</p>
        ) : null}
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}
