export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval: number,
): (...args: Parameters<T>) => void {
  let intervalId: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!intervalId) {
      fn.apply(this, args);
      intervalId = setTimeout(() => {
        clearTimeout(intervalId);
      }, interval);
    }
  };
}
