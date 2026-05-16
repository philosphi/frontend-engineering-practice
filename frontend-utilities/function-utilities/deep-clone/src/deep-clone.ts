export function deepClone<T>(value: T): T {
  const cloneMap = new WeakMap<WeakKey, T>();

  const clone = (value: T): T => {
    if (value === null || value === undefined || typeof value !== "object") {
      return value as T;
    } else if (cloneMap.has(value as WeakKey)) {
      return cloneMap.get(value as WeakKey) as T;
    } else if (Array.isArray(value)) {
      const clonedArr: T[] = [];
      cloneMap.set(value, clonedArr as T);
      (value as T[]).forEach((val) => {
        clonedArr.push(clone(val));
      });
      return clonedArr as T;
    } else if (value instanceof Date) {
      return new Date(value) as T;
    } else if (value instanceof RegExp) {
      return new RegExp(value) as T;
    } else {
      const clonedObj = new Object() as any;
      cloneMap.set(value, clonedObj as T);
      Object.keys(value).forEach((key) => {
        clonedObj[key] = clone((value as any)[key]);
      });
      return clonedObj as T;
    }
  };

  return clone(value);
}
