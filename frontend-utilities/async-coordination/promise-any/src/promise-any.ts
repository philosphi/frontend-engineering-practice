export function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  // your implementation here
  return Promise.reject(new AggregateError([], "All promises were rejected"));
}
