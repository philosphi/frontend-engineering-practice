export function myBind2(
  this: Function,
  thisArg: unknown,
  ...args: unknown[]
): (...bindArgs: unknown[]) => unknown {
  if (typeof this !== "function") {
    throw TypeError("this must be a function");
  }
  return (...bindArgs) => this.apply(thisArg, [...args, ...bindArgs]);
}
