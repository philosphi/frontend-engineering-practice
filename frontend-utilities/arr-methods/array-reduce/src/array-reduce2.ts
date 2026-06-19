export function myReduce2<T, V>(
  this: T[],
  callback: (acc: V, val: T, index: number, arr: T[]) => V,
  initial?: V,
): V {
  const isInitialValue = initial !== undefined;

  if (!this.length && !isInitialValue) {
    throw TypeError("array must be non-empty");
  }

  let acc = isInitialValue ? initial : (this[0] as V);

  for (let i = isInitialValue ? 0 : 1; i < this.length; i++) {
    if (i in this) {
      acc = callback(acc, this[i]!, i, this);
    }
  }

  return acc;
}
