let counter = 0;

export class WeakMapPolyfill<Key extends Nage.Entry, Value extends any> {
  name: string;

  constructor() {
    this.name = `wm_${counter++}_${(Math.random() * 1e9) >>> 0}`;
  }

  delete(key: Key) {
    const entry = key[this.name];

    if (entry && entry[0] === key) {
      entry[0] = undefined;
      entry[1] = undefined;
    }
  }

  get(key: Key) {
    const entry = key[this.name];

    if (entry && entry[0] === key) {
      return entry[1] as Value;
    }
  }

  has(key: Key) {
    const entry = key[this.name];

    return !!entry && entry[0] === key;
  }

  set(key: Key, value: Value) {
    if (key === null || typeof key !== 'object') {
      throw new TypeError('Invalid value used as weak map key');
    }

    const entry = key[this.name];

    if (entry && entry[0] === key) {
      entry[1] = value;
    } else {
      Object.defineProperty(key, this.name, {
        configurable: false,
        enumerable: false,
        value: [key, value],
        writable: true,
      });
    }

    return this;
  }
}

const _WeakMap =
  typeof WeakMap !== 'undefined' ? WeakMap : ((WeakMapPolyfill as unknown) as WeakMapConstructor);

export default _WeakMap;
