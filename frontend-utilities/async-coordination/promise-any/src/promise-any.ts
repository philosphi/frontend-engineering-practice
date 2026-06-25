export function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const errors = new Array(promises.length);
    if (!errors.length) reject(errors);
    let rejectedCount = 0;
    promises.forEach((promise, index) => {
      promise
        .then((value) => {
          resolve(value);
        })
        .catch((err) => {
          errors[index] = err;
          if (++rejectedCount === promises.length)
            reject(new AggregateError(errors, "All promises were rejected"));
        });
    });
  });
}
