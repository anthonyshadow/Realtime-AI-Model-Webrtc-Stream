export function cx(...values: Array<false | null | string | undefined>) {
  return values.filter(Boolean).join(" ");
}
