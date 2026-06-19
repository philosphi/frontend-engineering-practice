export function myFilter2<T>(
  this: T[],
  callback: (value: T, index: number, arr: T[]) => boolean,
  thisArg?: unknown,
) {
  if (typeof callback !== "function") {
    throw TypeError("callback must be a function");
  }

  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      if (callback.call(thisArg, this[i]!, i, this)) {
        result.push(this[i]);
      }
    }
  }

  return result;
}
