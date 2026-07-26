type Curried<Fn extends (...args: any[]) => any, Provided extends any[]> =
  Parameters<Fn> extends [...Provided, ...infer Remaining]
    ? Remaining extends []
      ? ReturnType<Fn>
      : <NextArgs extends any[]>(
          ...nextArgs: NextArgs
        ) => Curried<Fn, [...Provided, ...NextArgs]>
    : never;

export function myCurry2<Fn extends (...args: any[]) => any>(
  fn: Fn,
): Curried<Fn, []> {
  function makeCurried(soFar: any[]) {
    return function (this: unknown, ...nextArgs: any[]) {
      const combinedArgs = [...soFar, ...nextArgs];
      if (fn.length === combinedArgs.length) {
        return fn.apply(this, combinedArgs);
      }
      return makeCurried(combinedArgs);
    };
  }

  return makeCurried([]) as Curried<Fn, []>;
}
