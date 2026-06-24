export function myFlatten2(this: unknown[], depth: number = 1) {
  const result: unknown[] = [];

  const flatten = (item: unknown[], depth: number) => {
    item.forEach((val) => {
      if (Array.isArray(val) && depth > 0) {
        flatten(val, depth - 1);
      } else {
        result.push(val);
      }
    });
  };

  flatten(this, depth);

  return result;
}
