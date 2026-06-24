export type MyPartial2<T> = {
  [K in keyof T]?: T[K];
};

export type MyRequired2<T> = {
  [K in keyof T]-?: T[K];
};

export type MyReadonly2<T> = {
  readonly [K in keyof T]: T[K];
};

export type MyPick2<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type MyOmit2<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};

export type MyReturnType2<T extends (...args: any[]) => any> = T extends (
  ...arg: any[]
) => infer R
  ? R
  : never;
