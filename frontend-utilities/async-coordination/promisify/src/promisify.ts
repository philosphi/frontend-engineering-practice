export type Callback<T> = (err: Error | null, data?: T) => void;

export function promisify<T extends any[], R>(
  fn: (...allArgs: [...T, Callback<R>]) => any,
): (...args: T) => Promise<R> {
  return function (this: unknown, ...args: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const callback: Callback<R> = (err, data) => {
        if (err) {
          reject(err);
        } else if (data !== undefined) {
          resolve(data);
        } else {
          reject(Error("data is undefined"));
        }
      };
      fn.apply(this, [...args, callback]);
    });
  };
}
