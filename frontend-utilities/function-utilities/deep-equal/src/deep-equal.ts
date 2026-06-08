export function deepEqual(valueA: unknown, valueB: unknown): boolean {
  const visitedA = new Set();
  const visitedB = new Set();

  function isEqual(valA: unknown, valB: unknown): boolean {
    if (visitedA.has(valA) && visitedB.has(valB)) {
      return true;
    } else if (visitedA.has(valA) || visitedB.has(valB)) {
      return false;
    } else if (
      valA === null ||
      valB === null ||
      valA === undefined ||
      valB === undefined ||
      typeof valA !== "object" ||
      typeof valB !== "object"
    ) {
      return valA === valB;
    } else if (Array.isArray(valA) !== Array.isArray(valB)) {
      return false;
    } else if (Array.isArray(valA) && Array.isArray(valB)) {
      if (valA.length !== valB.length) return false;
      let areArraysEqual = true;
      valA.forEach((_, index) => {
        if (areArraysEqual && !isEqual(valA[index], valB[index])) {
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
    }
    visitedA.add(valA);
    visitedB.add(valB);

    const valAKeys = Object.keys(valA);
    const valBKeys = Object.keys(valB);
    if (valAKeys.length === valBKeys.length) {
      let areObjectsEqual = true;
      valAKeys.forEach((key) => {
        const valAValue = (valA as any)[key];
        const valBValue = (valB as any)[key];
        if (areObjectsEqual && !isEqual(valAValue, valBValue)) {
          areObjectsEqual = false;
        }
      });
      return areObjectsEqual;
    }

    return false;
  }

  return isEqual(valueA, valueB);
}
