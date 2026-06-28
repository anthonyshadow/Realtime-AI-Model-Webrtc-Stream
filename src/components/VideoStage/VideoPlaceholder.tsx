type VideoPlaceholderProps = {
  modelLabel: string;
};

export function VideoPlaceholder({ modelLabel }: VideoPlaceholderProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,_#262626_0,_#111_46%,_#050505_100%)] px-6">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium uppercase text-cyan-200/70">
          {modelLabel} realtime
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Start camera to begin
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          Your live preview appears here first, then Decart replaces it with the transformed stream.
        </p>
      </div>
    </div>
  );
}
