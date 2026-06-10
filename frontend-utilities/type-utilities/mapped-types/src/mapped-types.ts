export type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

export type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

export type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

export type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type MyOmit<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};

export type MyReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : never;
