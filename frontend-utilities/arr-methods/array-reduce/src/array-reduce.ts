export function myReduce<T, V>(
  this: T[],
  callback: (accumulator: V, item: T, index: number, arr: T[]) => V,
  initialValue?: V,
  thisArg?: unknown,
): V {
  if (typeof callback !== "function") {
    throw TypeError("callback must be a function");
  }

  if (!this.length) {
    throw TypeError("array must be non-empty");
  }

  const isInitialValue = initialValue !== undefined;
  let acc = isInitialValue ? initialValue : (this[0] as V);
  for (let i = isInitialValue ? 0 : 1; i < this.length; i++) {
    if (i in this) {
      acc = callback.call(thisArg, acc, this[i]!, i, this);
    }
  }

  return acc;
}
