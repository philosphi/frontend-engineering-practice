import { EventEmitter, OnceEmitter } from "./eventEmitter.js";
import assert from "assert";

const emitter = new EventEmitter();
const incrementEmitCount = () => emitCount++;

let emitCount = 0;
emitter.on("emit", incrementEmitCount);
emitter.emit("emit");
assert.strictEqual(emitCount, 1);
emitter.off("emit", incrementEmitCount);
emitter.emit("emit");
assert.strictEqual(emitCount, 1);

emitCount = 0;
emitter.once("emit", incrementEmitCount);
emitter.emit("emit");
assert.strictEqual(emitCount, 1);
emitter.emit("emit");
assert.strictEqual(emitCount, 1);

emitCount = 0;
emitter.once("emit", incrementEmitCount);
emitter.off("emit", incrementEmitCount);
emitter.emit("emit");
assert.strictEqual(emitCount, 0);

emitCount = 0;
const onceEmitter = new OnceEmitter();
onceEmitter.on("emit", incrementEmitCount);
onceEmitter.emit("emit");
assert.strictEqual(emitCount, 1);
onceEmitter.emit("emit");
assert.strictEqual(emitCount, 1);

emitCount = 0;
onceEmitter.on("emit", incrementEmitCount);
onceEmitter.off("emit", incrementEmitCount);
onceEmitter.emit("emit");
assert.strictEqual(emitCount, 0);
