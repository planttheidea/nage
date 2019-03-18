import { getEmptyObject, notifyError } from './utils';

/**
 * @constant EMPTY_OBJECT an empty object, to avoid unnecessary garbage when creating new pools
 */
const EMPTY_OBJECT = {};

/**
 * @var timeBasis the relative time basis to include in the id (incremented as counter)
 */
let timeBasis = Date.now() % 1e9;

/**
 * @class Nage
 *
 * @classdesc pool objects, generating new ones only when necessary
 */
class NagePool {
  entries: WeakMap<Nage.Entry, string>;
  generated: number;
  initialSize: number;
  name: string;
  create: Nage.Creator;
  onRelease: Nage.Handler;
  onReserve: Nage.Handler;
  onReset: Nage.ResetHandler;
  stack: Nage.Entry[];

  /**
   * @constructor
   *
   * @param [options] the options passed
   * @param [options.create=getEmptyObject] the method to create new pool entries
   * @param [options.onRelease] the function to call when releasing an entry back to the pool
   * @param [options.onReserve] the function to call when reserving an entry from the pool
   * @returns the pool
   */
  constructor({
    create = getEmptyObject,
    initialSize = 1,
    onRelease,
    onReserve,
    onReset,
  }: Nage.Options = EMPTY_OBJECT) {
    this.entries = new WeakMap();
    this.initialSize = initialSize;
    // eslint-disable-next-line no-bitwise
    this.name = `nage_${timeBasis++}_${(Math.random() * 1e9) >>> 0}`;
    this.stack = [];
    this.generated = 0;

    if (typeof create !== 'function') {
      throw new Error('create must be a function');
    }

    this.create = create;

    if (onRelease) {
      if (typeof onRelease === 'function') {
        this.onRelease = onRelease;
      } else {
        notifyError('onRelease must be a function');
      }
    }

    if (onReserve) {
      if (typeof onReserve === 'function') {
        this.onReserve = onReserve;
      } else {
        notifyError('onReserve must be a function');
      }
    }

    if (onReset) {
      if (typeof onReset === 'function') {
        this.onReset = onReset;
      } else {
        notifyError('onReset must be a function');
      }
    }

    if (initialSize) {
      for (let index = 0; index < initialSize; ++index) {
        this.stack.push(this.generate());
      }
    }
  }

  /**
   * @instance
   * @var available the number of items in the pool available for reservation
   */
  get available() {
    return this.stack.length;
  }

  /**
   * @instance
   * @var reserved the number of items in the pool currently reserved
   */
  get reserved() {
    return this.generated - this.stack.length;
  }

  /**
   * @instance
   * @var size the total number of items in the pool, both reserved and available
   */
  get size() {
    return this.generated;
  }

  /**
   * @instance
   * @function generate
   *
   * @description
   * create a new pool entry and add it to the list of entries
   *
   * @returns a new entry
   */
  generate() {
    const entry = this.create();

    this.entries.set(entry, this.name);

    ++this.generated;

    return entry;
  }

  /**
   * @instance
   * @function release
   *
   * @description
   * return the objects passed to the pool, if it is not already present
   *
   * @throws if the entry is not part of the original pool
   *
   * @param entry the entry to release back to the pool
   */
  release(entry: Nage.Entry) {
    const { onRelease, stack } = this;

    if (this.entries.get(entry) !== this.name) {
      return notifyError('Object passed is not part of this pool.');
    }

    if (stack.indexOf(entry) === -1) {
      if (onRelease) {
        onRelease(entry);
      }

      stack.push(entry);
    }
  }

  /**
   * @instance
   * @function reserve
   *
   * @description
   * get either an existing entry, or a newly-generated one
   *
   * @param numberOfEntries the number of entries to reserve
   * @returns a pool entry
   */
  reserve() {
    const { onReserve, stack } = this;

    const reserved = stack.length ? stack.pop() : this.generate();

    if (onReserve) {
      onReserve(reserved);
    }

    return reserved;
  }

  /**
   * @instance
   * @function reset
   *
   * @description
   * reset the stack of pool items to initial state
   */
  reset() {
    const { length } = this.stack;

    if (this.onReset) {
      this.onReset(this.stack);
    }

    if (length) {
      for (let index = 0; index < length; ++index) {
        this.entries.delete(this.stack[index]);
      }

      this.stack.length = 0;
    }

    this.generated = 0;

    for (let index = 0; index < this.initialSize; ++index) {
      this.stack.push(this.generate());
    }
  }
}

export default NagePool;
