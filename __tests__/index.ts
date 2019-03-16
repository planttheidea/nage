/* globals afterEach,beforeEach,describe,expect,it,jest */

import createNage from '../src';
import Nage from '../src/NagePool';

describe('default pool', () => {
  // @ts-ignore
  const original = global.DEV;

  beforeEach(() => {
    // @ts-ignore
    global.DEV = true;
  });

  afterEach(() => {
    // @ts-ignore
    global.DEV = original;
  });

  it('will create a pool with the default options', () => {
    const pool = createNage();

    expect(pool instanceof Nage).toBe(true);

    expect(pool.stack).toEqual([{}]);
  });

  it('will create a pool with an initial size', () => {
    const pool = createNage({
      initialSize: 3,
    });

    expect(pool instanceof Nage).toBe(true);

    expect(pool.stack).toEqual([{}, {}, {}]);
  });

  it('will reserve an object', () => {
    const pool = createNage();

    const object = pool.reserve();

    expect(pool.stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    expect(object).toEqual({});
  });

  it('will create a new object when trying to reserve with none remaining', () => {
    const pool = createNage();

    const object = pool.reserve();

    expect(pool.stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    expect(object).toEqual({});

    const object2 = pool.reserve();

    expect(pool.stack).toEqual([]);
    expect(pool.size).toEqual(2);
    expect(pool.reserved).toEqual(2);
    expect(pool.available).toEqual(0);

    expect(object2).toEqual({});
  });

  it('will release a reserved object', () => {
    const pool = createNage();

    expect(pool.stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);

    const object = pool.reserve();

    expect(pool.stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    pool.release(object);

    expect(pool.stack).toEqual([object]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);
  });

  it('will reset the pool of objects when no initial size', () => {
    const pool = createNage();

    expect(pool.stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);

    pool.reserve();

    expect(pool.stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    pool.reset();

    expect(pool.stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);
  });

  it('will reset the pool of objects when there is an initial size', () => {
    const pool = createNage({
      initialSize: 3,
    });

    expect(pool.stack).toEqual([{}, {}, {}]);
    expect(pool.size).toEqual(3);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(3);

    pool.reserve();

    expect(pool.stack).toEqual([{}, {}]);
    expect(pool.size).toEqual(3);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(2);

    pool.reset();

    expect(pool.stack).toEqual([{}, {}, {}]);
    expect(pool.size).toEqual(3);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(3);
  });

  it('will reset the pool of objects when there is an onReset handler', () => {
    const onReset = jest.fn();

    const pool = createNage({
      onReset,
    });

    expect(pool.stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);

    pool.reserve();

    expect(pool.stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    pool.reset();

    expect(pool.stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledWith(pool.stack);
  });
});

describe('custom pool', () => {
  // @ts-ignore
  const original = global.DEV;

  beforeEach(() => {
    // @ts-ignore
    global.DEV = true;
  });

  afterEach(() => {
    // @ts-ignore
    global.DEV = original;
  });

  it('will create a pool with a custom creator', () => {
    const options = {
      create() {
        return {
          foo: 'bar',
          bar: 'baz',
        };
      },
    };
    const pool = createNage(options);

    expect(pool instanceof Nage).toBe(true);

    const object = pool.reserve();

    expect(pool.stack).toEqual([]);

    expect(object).toEqual({
      foo: 'bar',
      bar: 'baz',
    });

    pool.release(object);

    expect(pool.stack).toEqual([object]);

    const sameObject = pool.reserve();

    expect(sameObject).toBe(object);

    expect(pool.stack).toEqual([]);
  });

  it('will create a pool with an onReserve handler', () => {
    const options = {
      onReserve(reserved: { foo: string }) {
        // eslint-disable-next-line no-param-reassign
        reserved.foo = 'bar';
      },
    };
    const pool = createNage(options);

    expect(pool instanceof Nage).toBe(true);

    const object = pool.reserve();

    expect(pool.stack).toEqual([]);

    expect(object).toEqual({
      foo: 'bar',
    });

    pool.release(object);

    expect(pool.stack).toEqual([object]);

    const sameObject = pool.reserve();

    expect(sameObject).toBe(object);

    expect(pool.stack).toEqual([]);
  });

  it('will create a pool with an onRelease handler', () => {
    const options = {
      onRelease(released: { [key: string]: any }) {
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in released) {
          // eslint-disable-next-line no-param-reassign
          delete released[key];
        }
      },
    };
    const pool = createNage(options);

    expect(pool instanceof Nage).toBe(true);

    const object = pool.reserve();

    expect(pool.stack).toEqual([]);

    expect(object).toEqual({});

    object.foo = 'bar';

    pool.release(object);

    expect(pool.stack).toEqual([object]);

    const sameObject = pool.reserve();

    expect(sameObject).toBe(object);
    expect(sameObject).toEqual({});

    expect(pool.stack).toEqual([]);
  });

  it('will create a pool with a custom creator and onReserve + onRelease handlers', () => {
    const options = {
      create() {
        return {
          bar: 'baz',
        };
      },
      onReserve(reserved: { foo: string }) {
        // eslint-disable-next-line no-param-reassign
        reserved.foo = 'bar';
      },
      onRelease(released: { [key: string]: any }) {
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in released) {
          // eslint-disable-next-line no-param-reassign
          delete released[key];
        }
      },
    };
    const pool = createNage(options);

    expect(pool instanceof Nage).toBe(true);

    const object = pool.reserve();

    expect(pool.stack).toEqual([]);

    expect(object).toEqual({
      bar: 'baz',
      foo: 'bar',
    });

    pool.release(object);

    expect(pool.stack).toEqual([object]);
    expect(object).toEqual({});

    const sameObject = pool.reserve();

    expect(sameObject).toBe(object);
    expect(sameObject).toEqual({
      foo: 'bar',
    });

    expect(pool.stack).toEqual([]);
  });
});

describe('error states', () => {
  // @ts-ignore
  const original = global.DEV;

  beforeEach(() => {
    // @ts-ignore
    global.DEV = true;
  });

  afterEach(() => {
    // @ts-ignore
    global.DEV = original;
  });

  it('will throw when create is not a function', () => {
    // @ts-ignore
    expect(() => createNage({ create: 'foo' })).toThrow();
  });

  it('will throw when onRelease is not a function', () => {
    // @ts-ignore
    expect(() => createNage({ onRelease: 'foo' })).toThrow();
  });

  it('will throw when onReserve is not a function', () => {
    // @ts-ignore
    expect(() => createNage({ onReserve: 'foo' })).toThrow();
  });

  it('will throw when onReset is not a function', () => {
    // @ts-ignore
    expect(() => createNage({ onReset: 'foo' })).toThrow();
  });

  it('will throw an error if the entry being released is not from the pool', () => {
    const pool = createNage();

    expect(() => pool.release({})).toThrow();
  });
});
