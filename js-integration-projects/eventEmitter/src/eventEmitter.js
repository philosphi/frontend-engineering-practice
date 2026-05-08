export class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, listener) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).push(listener);
    } else {
      this.listeners.set(event, [listener]);
    }
  }

  off(event, listener) {
    if (this.listeners.has(event)) {
      this.listeners.set(
        event,
        this.listeners
          .get(event)
          .filter((l) => l !== listener && l._original !== listener),
      );
    }
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((l) => l(...args));
    }
  }

  once(event, listener) {
    const runOnce = () => {
      listener();
      this.off(event, listener);
    };

    runOnce._original = listener;

    this.on(event, runOnce);
  }
}

export class OnceEmitter extends EventEmitter {
  constructor() {
    super();
  }

  on(event, listener) {
    const runOnce = () => {
      listener();
      this.off(event, listener);
    };

    runOnce._original = listener;

    super.on(event, runOnce);
  }
}
