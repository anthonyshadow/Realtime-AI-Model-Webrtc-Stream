export function VideoPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,_#262626_0,_#111_46%,_#050505_100%)] px-6">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-200/70">
          Lucy 2.1 Realtime
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Start camera to begin
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          This scaffold shows the intended full-screen video surface. Webcam and Decart
          realtime connection come in the next implementation phases.
        </p>
      </div>
    </div>
  );
}
