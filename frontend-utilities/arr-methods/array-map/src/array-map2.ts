export function myMap2<T, V>(
  this: T[],
  callback: (val: T, index: number, arr: T[]) => V,
  thisArg: unknown,
) {
  if (typeof callback !== "function") {
    throw TypeError("callback must be a function");
  }
  const result = new Array<V>(this.length);

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result[i] = callback.call(thisArg, this[i]!, i, this);
    }
  }

  return result;
}

type Dog = {
  name: String;
  coat: String;
  breed: String;
  age: number;
  sex: string;
  neutered: boolean;
};

type optionalDog = Pick<Dog, "name">;
