export async function promiseAll(
  promises: Promise<unknown>[],
): Promise<unknown[]> {
  const results: unknown[] = [];

  const execute = async (): Promise<unknown[]> => {
    return new Promise<unknown[]>((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i]!.then((result) => {
          results[i] = result;
        }).catch((err) => {
          reject(err);
        });
      }
      resolve(results);
    });
  };

  return await execute();
}
