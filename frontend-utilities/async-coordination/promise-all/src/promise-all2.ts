export function promiseAll2<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    if (!promises.length) resolve([]);
    const result = new Array(promises.length);
    let successCount = 0;
    promises.forEach((p, i) => {
      p.then((val) => {
        result[i] = val;
        if (++successCount === promises.length) {
          resolve(result);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  });
}
