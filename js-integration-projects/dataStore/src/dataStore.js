import { EventEmitter } from "./eventEmitter.js";

const StoreEvent = {
  create: "create",
  update: "update",
  delete: "delete",
};

Object.freeze(StoreEvent);

class Store {
  constructor() {
    this.records = new Map();
    this.emitter = new EventEmitter();
  }

  on(event, listener) {
    if (Object.hasOwn(StoreEvent, event)) {
      this.emitter.on(event, listener);
      console.log(`${event} event registered`);
    } else {
      console.log("Event not supported");
    }
  }

  off(event, listener) {
    if (Object.hasOwn(StoreEvent, event)) {
      this.emitter.off(event, listener);
      console.log(`${event} event deregistered`);
    } else {
      console.log("Event not supported");
    }
  }

  get(id) {
    return this.records.get(id);
  }

  set(id, record) {
    const isExistingRecord = this.records.has(id);
    this.records.set(id, record);
    this.emitter.emit(
      isExistingRecord ? StoreEvent.update : StoreEvent.create,
      id,
      record,
    );
  }

  delete(id) {
    this.records.delete(id);
    this.emitter.emit(StoreEvent.delete, id);
  }

  reset() {
    this.records = new Map();
    this.emitter = new EventEmitter();
  }
}

export default new Store();
