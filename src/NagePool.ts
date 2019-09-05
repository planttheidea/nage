import { getEmptyObject, notifyError } from './utils';
import WeakMap from './weakMap';

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
class NagePool<Pooled extends {} = Nage.Entry> {
  protected _entries: WeakMap<Pooled, string>;
  protected _generated: number;
  protected _id: string;
  protected _stack: Pooled[];

  readonly create: Nage.Creator<Pooled>;
  readonly initialSize: number;
  readonly maxSize: number;
  readonly name: number | string | symbol;
  readonly onRelease: Nage.Handler<Pooled>;
  readonly onReserve: Nage.Handler<Pooled>;
  readonly onReset: Nage.ResetHandler<Pooled>;

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
    maxSize = Infinity,
    name,
    onRelease,
    onReserve,
    onReset,
  }: Nage.Options<Pooled> = EMPTY_OBJECT) {
    this._entries = new WeakMap<Pooled, string>();
    this._id = `nage_${timeBasis++}_${(Math.random() * 1e9) >>> 0}`;
    this._stack = [];
    this._generated = 0;

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

    const computedInitialSize = Math.min(initialSize, maxSize);

    this.initialSize = computedInitialSize;
    this.maxSize = maxSize;

    if (computedInitialSize) {
      const { _stack: stack } = this;

      for (let index = 0; index < computedInitialSize; ++index) {
        stack.push(this._generate());
      }
    }

    this.name = name;
  }

  /**
   * @instance
   * @var available the number of items in the pool available for reservation
   */
  get available() {
    return this._stack.length;
  }

  /**
   * @instance
   * @var reserved the number of items in the pool currently reserved
   */
  get reserved() {
    return this._generated - this._stack.length;
  }

  /**
   * @instance
   * @var size the total number of items in the pool, both reserved and available
   */
  get size() {
    return this._generated;
  }

  /**
   * @instance
   * @function _generate
   *
   * @description
   * create a new pool entry and add it to the list of _entries
   *
   * @returns a new entry
   */
  _generate() {
    const entry = this.create();

    this._entries.set(entry, this._id);

    ++this._generated;

    return entry;
  }

  /**
   * @instance
   * @function release
   *
   * @description
   * return the entry passed to the pool if not already present
   *
   * @throws if the entry is not part of the original pool
   *
   * @param entry the entry to release back to the pool
   */
  release(entry: Pooled) {
    if (this._entries.get(entry) !== this._id) {
      return notifyError('Object passed is not part of this pool.');
    }

    const { onRelease, _stack: stack } = this;

    if (stack.length < this.maxSize && stack.indexOf(entry) === -1) {
      if (onRelease) {
        onRelease(entry);
      }

      stack.push(entry);
    }
  }

  /**
   * @instance
   * @function releaseN
   *
   * @description
   * return the entries passed to the pool if not already present
   *
   * @param entries the entries to release back to the pool
   */
  releaseN(entries: Pooled[]) {
    entries.forEach((entry) => this.release(entry));
  }

  /**
   * @instance
   * @function reserve
   *
   * @description
   * get either an existing entry, or a newly-_generated one
   *
   * @param numberOfEntries the number of _entries to reserve
   * @returns a pool entry
   */
  reserve(): Pooled {
    const { onReserve, _stack: stack } = this;

    const reserved = stack.length ? stack.pop() : this._generate();

    if (onReserve) {
      onReserve(reserved);
    }

    return reserved;
  }

  /**
   * @instance
   * @function reserveN
   *
   * @description
   * get reserve multiple entries from the pool
   *
   * @param size the number of entries to reserve
   * @returns an array of pool entries
   */
  reserveN(size: number): Pooled[] {
    const reservations = new Array(size);

    for (let index = 0; index < size; ++index) {
      reservations[index] = this.reserve();
    }

    return reservations;
  }

  /**
   * @instance
   * @function reset
   *
   * @description
   * reset the _stack of pool items to initial state
   */
  reset() {
    const { initialSize, onReset, _stack: stack } = this;

    if (onReset) {
      onReset(stack);
    }

    const { length } = stack;

    if (length) {
      const { _entries: entries } = this;

      for (let index = 0; index < length; ++index) {
        entries.delete(stack[index]);
      }

      stack.length = 0;
    }

    this._generated = 0;

    for (let index = 0; index < initialSize; ++index) {
      stack.push(this._generate());
    }
  }
}

export default NagePool;
