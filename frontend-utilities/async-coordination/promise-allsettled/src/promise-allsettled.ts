export function promiseAllSettled<T>(
  promises: Promise<T>[],
): Promise<PromiseSettledResult<T>[]> {
  return new Promise((resolve) => {
    const results: PromiseSettledResult<T>[] = new Array(promises.length);
    if (!results.length) resolve(results);
    let terminatedCount = 0;
    promises.forEach((promise, index) => {
      promise
        .then((result) => {
          results[index] = {
            status: "fulfilled",
            value: result,
          };
        })
        .catch((error) => {
          results[index] = {
            status: "rejected",
            reason: error,
          };
        })
        .finally(() => {
          if (++terminatedCount === promises.length) resolve(results);
        });
    });
  });
}
