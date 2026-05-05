export const withRetry = async (fn, options) => {
  const { baseDelay, maxRetries } = options;

  if (typeof fn !== "function") {
    throw new TypeError("fn must be a function");
  }

  if (baseDelay < 0) {
    throw new RangeError("baseDelay must be a non-negative number");
  }

  if (maxRetries < 0 || !Number.isInteger(maxRetries)) {
    throw new RangeError("maxRetries must be a non-negative integer");
  }

  function* generateDelay() {
    yield baseDelay;
    let multiplier = 1;
    while (true) {
      yield baseDelay * 2 * multiplier;
      multiplier = multiplier * 2;
    }
  }

  const delays = generateDelay();

  let retryCount = 0;
  const attempt = async () => {
    try {
      return await fn();
    } catch (err) {
      if (retryCount >= maxRetries) {
        throw err;
      }
    }

    retryCount = retryCount + 1;
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, delays.next().value);
    });

    return await attempt();
  };

  return await attempt();
};
