type Curried<Fn extends (...args: any[]) => any, Provided extends any[]> =
  Parameters<Fn> extends [...Provided, ...infer Remaining]
    ? Remaining extends []
      ? ReturnType<Fn>
      : <NextArgs extends any[]>(
          ...nextArgs: NextArgs
        ) => Curried<Fn, [...Provided, ...NextArgs]>
    : never;

export function myCurry<Fn extends (...args: any[]) => any>(
  fn: Fn,
): Curried<Fn, []> {
  const makeCurried: (providedArgs: any[]) => any = (providedArgs) => {
    return (...nextArgs: any[]) => {
      const combinedArgs = [...providedArgs, ...nextArgs];
      if (fn.length === combinedArgs.length) {
        return fn(...combinedArgs);
      }
      return makeCurried(combinedArgs);
    };
  };

  return makeCurried([]) as Curried<Fn, []>;
}

type Curried2<Params extends any[], Return> = {
  <Passed extends any[]>(
    ...args: Passed
  ): Params extends [...Passed, ...infer Remaining]
    ? Remaining extends []
      ? Return
      : Curried2<Remaining, Return>
    : never;
};

export function myCurry2<Fn extends (...args: any[]) => any>(
  fn: Fn,
): Curried2<Parameters<Fn>, ReturnType<Fn>> {
  const makeCurried: (providedArgs: any[]) => any = (providedArgs) => {
    return (...nextArgs: any[]) => {
      const combinedArgs = [...providedArgs, ...nextArgs];
      if (fn.length >= combinedArgs.length) {
        return fn(...combinedArgs);
      }
      return makeCurried(combinedArgs);
    };
  };

  return makeCurried([]) as Curried2<Parameters<Fn>, ReturnType<Fn>>;
}
