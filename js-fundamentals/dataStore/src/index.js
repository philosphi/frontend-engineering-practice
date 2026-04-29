import store from "./dataStore.js";
import assert from "assert";

let createCount = 0;
let updateCount = 0;
let deleteCount = 0;

const updateListener = (id, record) => {
  updateCount++;
  console.log(`${id} updated: ${JSON.stringify(record)}`);
};

const createListener = (id, record) => {
  createCount++;
  console.log(`${id} created: ${JSON.stringify(record)}`);
};

const deleteListener = (id) => {
  deleteCount++;
  console.log(`${id} deleted`);
};

const makeUbe = () => ({
  color: "black",
  breed: "chow chow",
});

const resetStore = () => {
  store.reset();

  createCount = 0;
  updateCount = 0;
  deleteCount = 0;
};

store.on("create", createListener);
store.on("update", updateListener);
store.on("delete", deleteListener);
store.set("ube", makeUbe());

assert.strictEqual(createCount, 1);
assert.strictEqual(updateCount, 0);
assert.strictEqual(deleteCount, 0);

resetStore();

store.on("create", createListener);
store.on("update", updateListener);
store.on("delete", deleteListener);
store.set("ube", makeUbe());
store.set("ube", {
  color: "black",
  breed: "chow chow mix",
  coat: "furry",
});

assert.strictEqual(createCount, 1);
assert.strictEqual(updateCount, 1);
assert.strictEqual(deleteCount, 0);

resetStore();

store.on("create", createListener);
store.on("update", updateListener);
store.on("delete", deleteListener);

store.set("ube", makeUbe());
store.set("ube", {
  color: "black",
  breed: "chow chow mix",
  coat: "furry",
});
store.off("update", updateListener);
store.set("ube", {
  color: "black",
  breed: "chow chow mix",
  coat: "furry",
});

assert.strictEqual(createCount, 1);
assert.strictEqual(updateCount, 1);
assert.strictEqual(deleteCount, 0);

resetStore();

store.on("create", createListener);
store.on("update", updateListener);
store.on("delete", deleteListener);
store.delete("ube");

assert.strictEqual(store.get("ube"), undefined);
assert.strictEqual(createCount, 0);
assert.strictEqual(updateCount, 0);
assert.strictEqual(deleteCount, 1);

resetStore();

store.on("create", createListener);
store.on("update", updateListener);
store.on("delete", deleteListener);
store.on("destroy", deleteListener);

assert.strictEqual(createCount, 0);
assert.strictEqual(updateCount, 0);
assert.strictEqual(deleteCount, 0);
