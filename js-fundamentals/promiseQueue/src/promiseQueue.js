/**
 * Runs async tasks with a concurrency limit.
 * Resolves with results in original task order.
 * Rejects immediately if any task fails.
 *
 * @param {Function[]} tasks - Array of functions that return Promises
 * @param {number} concurrency - Max tasks running simultaneously
 * @returns {Promise<any[]>}
 */
export async function promiseQueue(tasks, concurrency) {
  const result = new Array(tasks.length);

  if (tasks.length === 0 || concurrency < 1) {
    return result;
  }

  const taskQueue = tasks.map((task, i) => ({
    task,
    i,
  }));

  const workerPool = [];

  const runWorker = async (task, index) => {
    try {
      const response = await task();
      result[index] = response;
    } catch (err) {
      result[index] = err;
      return Promise.reject(err);
    }

    if (taskQueue.length > 0) {
      const { task: nextTask, i } = taskQueue.shift();
      return runWorker(nextTask, i);
    }
  };

  const workerCount = Math.min(concurrency, taskQueue.length);

  for (let i = 0; i < workerCount; i++) {
    const { task, i: taskIndex } = taskQueue.shift();
    workerPool.push(() => runWorker(task, taskIndex));
  }

  await Promise.all(workerPool.map((fn) => fn()));

  return result;
}
