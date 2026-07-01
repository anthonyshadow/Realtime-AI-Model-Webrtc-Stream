type VideoPlaceholderProps = {
  description: string;
  eyebrow: string;
};

export function VideoPlaceholder({ description, eyebrow }: VideoPlaceholderProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,_#262626_0,_#111_46%,_#050505_100%)] px-5 sm:px-6">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium uppercase text-cyan-200/70">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:mt-4 sm:text-4xl">
          Start camera to begin
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          {description}
        </p>
      </div>
    </div>
  );
}
