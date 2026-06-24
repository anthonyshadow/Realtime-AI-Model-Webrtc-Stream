type ErrorBannerProps = {
  error: string | null;
};

export function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) {
    return (
      <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-neutral-500">
        No active errors.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-red-300/30 bg-red-500/15 px-3 py-2 text-sm text-red-100">
      {error}
    </div>
  );
}
