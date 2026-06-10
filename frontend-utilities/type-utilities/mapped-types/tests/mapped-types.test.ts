import {
  MyPartial,
  MyRequired,
  MyReadonly,
  MyPick,
  MyOmit,
  MyReturnType,
} from "../src/mapped-types";

type Assert<T extends true> = T;
type Equals<A, B> = A extends B ? (B extends A ? true : false) : false;

type Dog = {
  name: String;
  coat: String;
  breed: String;
  age: number;
  sex: string;
  neutered: boolean;
};

type GetDogByName = (name: String) => Dog;

type myPartial = Assert<Equals<MyPartial<Dog>, Partial<Dog>>>;
type myRequired = Assert<Equals<MyRequired<Dog>, Required<Dog>>>;
type myReadonly = Assert<Equals<MyReadonly<Dog>, Readonly<Dog>>>;
type myPick = Assert<
  Equals<MyPick<Dog, "age" | "breed">, Pick<Dog, "age" | "breed">>
>;
type myOmit = Assert<Equals<MyOmit<Dog, "coat">, Omit<Dog, "coat">>>;
type myReturnType = Assert<
  Equals<MyReturnType<GetDogByName>, ReturnType<GetDogByName>>
>;
