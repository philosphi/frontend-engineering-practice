export function myMap<T, V>(
  this: T[],
  callback: (item: T, index: number, array: T[]) => V,
): V[] {
  if (typeof callback !== "function") {
    throw TypeError("callback must be a function");
  }

  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result[i] = callback.call(this, this[i]!, i, this);
    }
  }
  return result;
}
