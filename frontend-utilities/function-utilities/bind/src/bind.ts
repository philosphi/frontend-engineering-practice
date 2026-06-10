export function myBind(
  this: (...args: unknown[]) => unknown,
  thisArg: unknown,
  ...args: unknown[]
): (...bindArgs: unknown[]) => unknown {
  if (typeof this !== "function") {
    throw TypeError("this must be a function");
  }
  return (...bindArgs) => this.apply(thisArg, [...args, ...bindArgs]);
}
