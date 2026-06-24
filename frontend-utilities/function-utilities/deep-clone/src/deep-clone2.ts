export function deepClone2<T>(value: T): T {
  const visitedMap = new WeakMap<WeakKey, unknown>();

  const clone = (val: unknown) => {
    if (val === null || val === undefined || typeof val !== "object") {
      return val;
    } else if (visitedMap.has(val as WeakKey)) {
      return visitedMap.get(val as WeakKey);
    } else if (Array.isArray(val)) {
      const clonedArr: unknown[] = [];
      visitedMap.set(val as WeakKey, clonedArr);
      val.forEach((value) => {
        clonedArr.push(clone(value));
      });
      return clonedArr;
    } else if (val instanceof Date) {
      return new Date(val.getTime());
    } else if (val instanceof RegExp) {
      return new RegExp(val.source, val.flags);
    } else {
      const clonedObj = {};
      visitedMap.set(val as WeakKey, clonedObj);
      Object.entries(val).forEach(([key, value]) => {
        (clonedObj as any)[key] = clone(value);
      });
      return clonedObj;
    }
  };

  return clone(value) as T;
}
