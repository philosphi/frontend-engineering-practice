export function myFlatten(this: unknown[], depth: number = 1): unknown[] {
  const result = new Array();

  // const flatten = (arr: unknown[], depth: number): void => {
  //   for (let i = 0; i < arr.length; i++) {
  //     if (i in arr) {
  //       const value = arr[i];
  //       if (!Array.isArray(value)) {
  //         result.push(value);
  //       } else {
  //         if (depth > 0) {
  //           flatten(value, depth - 1);
  //         } else {
  //           result.push(value);
  //         }
  //       }
  //     }
  //   }
  // };

  const flatten = (item: unknown, depth: number) => {
    if (!Array.isArray(item) || depth < 0) {
      result.push(item);
    } else {
      for (let i = 0; i < item.length; i++) {
        if (i in item) {
          const value = item[i];
          flatten(value, depth - 1);
        }
      }
    }
  };

  flatten(this, depth);
  return result;
}
