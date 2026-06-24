export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval: number,
): (...args: Parameters<T>) => void {
  // your implementation here
  return () => {};
}
