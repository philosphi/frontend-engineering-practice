export function promiseAll(promises: Promise<unknown>[]): Promise<unknown[]> {
  return new Promise<unknown[]>((resolve, reject) => {
    const results: unknown[] = new Array(promises.length);
    if (!results.length) {
      resolve(results);
    }
    const promiseCount = promises.length;
    let resolvedCount = 0;
    promises.forEach((promise, index) => {
      promise
        .then((result) => {
          results[index] = result;
          if (++resolvedCount === promiseCount) {
            resolve(results);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}
