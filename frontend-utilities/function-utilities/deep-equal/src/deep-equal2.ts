export function deepEqual2<T, V>(valA: T, valB: V): boolean {
  const visitedMap = new WeakMap<WeakKey, unknown>();

  const isEqual = (valA: unknown, valB: unknown) => {
    if (
      valA === null ||
      valA === undefined ||
      typeof valA !== "object" ||
      valB === null ||
      valB === undefined ||
      typeof valB !== "object"
    ) {
      return valA === valB;
    } else if (visitedMap.has(valA as WeakKey)) {
      return visitedMap.get(valA as WeakKey) === valB;
    } else if (Array.isArray(valA) !== Array.isArray(valB)) {
      return false;
    } else if (Array.isArray(valA) && Array.isArray(valB)) {
      if (valA.length !== valB.length) return false;
      visitedMap.set(valA as WeakKey, valB);
      let areArraysEqual = true;
      valA.forEach((_, index) => {
        if (!isEqual(valA[index], valB[index])) {
          areArraysEqual = false;
        }
      });
      return areArraysEqual;
    } else if (valA instanceof Date !== valB instanceof Date) {
      return false;
    } else if (valA instanceof Date && valB instanceof Date) {
      return valA.getTime() === valB.getTime();
    } else if (valA instanceof RegExp !== valB instanceof RegExp) {
      return false;
    } else if (valA instanceof RegExp && valB instanceof RegExp) {
      return valA.flags === valB.flags && valA.source === valB.source;
    } else {
      if (Object.keys(valA as any).length !== Object.keys(valB as any).length)
        return false;
      visitedMap.set(valA as WeakKey, valB);
      let areObjectsEqual = true;
      Object.keys(valA as any).forEach((key: string) => {
        if (!isEqual((valA as any)[key], (valB as any)[key])) {
          areObjectsEqual = false;
        }
      });
      return areObjectsEqual;
    }
  };

  return isEqual(valA, valB);
}
