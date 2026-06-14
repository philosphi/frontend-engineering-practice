export function myCall(
  this: Function,
  thisArg: unknown,
  ...args: unknown[]
): unknown {
  if (typeof this !== "function") {
    throw TypeError("'this' must be a function");
  }
  if (
    thisArg === null ||
    thisArg === undefined ||
    (typeof thisArg !== "object" && typeof thisArg !== "function")
  ) {
    throw TypeError("thisArg must be an object or function");
  }
  const fn = Symbol();
  const extendedThisArg = thisArg as unknown & { [fn]?: Function };
  extendedThisArg[fn] = this;
  try {
    return extendedThisArg[fn](...args);
  } finally {
    delete extendedThisArg[fn];
  }
}
