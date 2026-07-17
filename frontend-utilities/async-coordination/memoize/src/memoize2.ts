export function memoize2<Fn extends (...args: any[]) => any>(
  fn: Fn,
): (...args: Parameters<Fn>) => ReturnType<Fn> {
  const cache = new Map<string, ReturnType<Fn>>();

  return function (this: unknown, ...args) {
    const key = JSON.stringify(args);

    if (!cache.has(key)) {
      cache.set(key, fn.apply(this, args));
    }

    return cache.get(key)!;
  };
}
