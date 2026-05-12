export function myFilter<T>(
  this: T[],
  callback: (item: T, index: number, arr: T[]) => boolean,
  thisArg?: unknown,
): T[] {
  if (typeof callback !== "function") {
    throw TypeError("callback must be a function");
  }
  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      const item = this[i]!;
      if (callback.call(thisArg, item, i, this)) {
        result.push(item);
      }
    }
  }

  return result;
}
