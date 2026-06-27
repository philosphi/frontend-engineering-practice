export async function mapAsyncLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number,
): Promise<R[]> {
  if (limit < 1) {
    throw RangeError("limit must be greater than 0");
  }
  const results = new Array(items.length);
  const workerQueue = items.map((item, index) => ({ item, index }));

  async function run(item: T, index: number) {
    const result = await fn(item);
    results[index] = result;
    if (workerQueue.length) {
      const { item: nextItem, index: nextIndex } = workerQueue.shift()!;
      await run(nextItem, nextIndex);
    }
  }

  const workerPool: Promise<void>[] = [];
  const workerPoolSize = Math.min(limit, items.length);

  for (let i = 0; i < workerPoolSize; i++) {
    const { item: nextItem, index: nextIndex } = workerQueue.shift()!;
    workerPool.push(run(nextItem, nextIndex));
  }

  await Promise.all(workerPool);

  return results;
}
