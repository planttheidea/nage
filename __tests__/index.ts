/* globals afterEach,beforeEach,describe,expect,it,jest */

import createNage from '../src';
import Nage from '../src/NagePool';

describe('default pool', () => {
  it('will create a pool with the default options', () => {
    const pool = createNage();

    expect(pool instanceof Nage).toBe(true);

    // @ts-ignore
    expect(pool._stack).toEqual([{}]);
  });

  it('will create a pool with a name', () => {
    const name = 'pool';
    const pool = createNage({ name });

    expect(pool instanceof Nage).toBe(true);

    // @ts-ignore
    expect(pool._stack).toEqual([{}]);
    expect(pool.name).toEqual(name);
  });

  it('will create a pool with an initial size', () => {
    const pool = createNage({
      initialSize: 3,
    });

    expect(pool instanceof Nage).toBe(true);

    // @ts-ignore
    expect(pool._stack).toEqual([{}, {}, {}]);
  });

  it('will reserve an object', () => {
    const pool = createNage();

    const object = pool.reserve();

    // @ts-ignore
    expect(pool._stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    expect(object).toEqual({});
  });

  it('will reserve multiple objects', () => {
    const pool = createNage();

    const objects = pool.reserveN(5);

    // @ts-ignore
    expect(pool._stack).toEqual([]);
    expect(pool.size).toEqual(5);
    expect(pool.reserved).toEqual(5);
    expect(pool.available).toEqual(0);

    expect(objects).toEqual([{}, {}, {}, {}, {}]);
  });

  it('will create a new object when trying to reserve with none remaining', () => {
    const pool = createNage();

    const object = pool.reserve();

    // @ts-ignore
    expect(pool._stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    expect(object).toEqual({});

    const object2 = pool.reserve();

    // @ts-ignore
    expect(pool._stack).toEqual([]);
    expect(pool.size).toEqual(2);
    expect(pool.reserved).toEqual(2);
    expect(pool.available).toEqual(0);

    expect(object2).toEqual({});
  });

  it('will release a reserved object', () => {
    const pool = createNage();

    // @ts-ignore
    expect(pool._stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);

    const object = pool.reserve();

    // @ts-ignore
    expect(pool._stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    pool.release(object);

    // @ts-ignore
    expect(pool._stack).toEqual([object]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);
  });

  it('will release multiple reserved objects', () => {
    const pool = createNage();

    // @ts-ignore
    expect(pool._stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);

    const size = 5;

    const objects = pool.reserveN(size);

    // @ts-ignore
    expect(pool._stack).toEqual([]);
    expect(pool.size).toEqual(size);
    expect(pool.reserved).toEqual(size);
    expect(pool.available).toEqual(0);

    pool.releaseN(objects);

    // @ts-ignore
    expect(pool._stack).toEqual(objects);
    expect(pool.size).toEqual(size);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(size);
  });

  it('will reset the pool of objects when no initial size', () => {
    const pool = createNage();

    // @ts-ignore
    expect(pool._stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);

    pool.reserve();

    // @ts-ignore
    expect(pool._stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    pool.reset();

    // @ts-ignore
    expect(pool._stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);
  });

  it('will reset the pool of objects when there is an initial size', () => {
    const pool = createNage({
      initialSize: 3,
    });

    // @ts-ignore
    expect(pool._stack).toEqual([{}, {}, {}]);
    expect(pool.size).toEqual(3);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(3);

    pool.reserve();

    // @ts-ignore
    expect(pool._stack).toEqual([{}, {}]);
    expect(pool.size).toEqual(3);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(2);

    pool.reset();

    // @ts-ignore
    expect(pool._stack).toEqual([{}, {}, {}]);
    expect(pool.size).toEqual(3);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(3);
  });

  it('will reset the pool of objects when there is an onReset handler', () => {
    const onReset = jest.fn();

    const pool = createNage({
      onReset,
    });

    // @ts-ignore
    expect(pool._stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);

    pool.reserve();

    // @ts-ignore
    expect(pool._stack).toEqual([]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(1);
    expect(pool.available).toEqual(0);

    pool.reset();

    // @ts-ignore
    expect(pool._stack).toEqual([{}]);
    expect(pool.size).toEqual(1);
    expect(pool.reserved).toEqual(0);
    expect(pool.available).toEqual(1);

    expect(onReset).toHaveBeenCalledTimes(1);
    // @ts-ignore
    expect(onReset).toHaveBeenCalledWith(pool._stack);
  });
});

describe('custom pool', () => {
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

    // @ts-ignore
    expect(pool._stack).toEqual([]);

    expect(object).toEqual({
      foo: 'bar',
      bar: 'baz',
    });

    pool.release(object);

    // @ts-ignore
    expect(pool._stack).toEqual([object]);

    const sameObject = pool.reserve();

    expect(sameObject).toBe(object);

    // @ts-ignore
    expect(pool._stack).toEqual([]);
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

    // @ts-ignore
    expect(pool._stack).toEqual([]);

    expect(object).toEqual({
      foo: 'bar',
    });

    pool.release(object);

    // @ts-ignore
    expect(pool._stack).toEqual([object]);

    const sameObject = pool.reserve();

    expect(sameObject).toBe(object);

    // @ts-ignore
    expect(pool._stack).toEqual([]);
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

    // @ts-ignore
    expect(pool._stack).toEqual([]);

    expect(object).toEqual({});

    object.foo = 'bar';

    pool.release(object);

    // @ts-ignore
    expect(pool._stack).toEqual([object]);

    const sameObject = pool.reserve();

    expect(sameObject).toBe(object);
    expect(sameObject).toEqual({});

    // @ts-ignore
    expect(pool._stack).toEqual([]);
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

    // @ts-ignore
    expect(pool._stack).toEqual([]);

    expect(object).toEqual({
      bar: 'baz',
      foo: 'bar',
    });

    pool.release(object);

    // @ts-ignore
    expect(pool._stack).toEqual([object]);
    expect(object).toEqual({});

    const sameObject = pool.reserve();

    expect(sameObject).toBe(object);
    expect(sameObject).toEqual({
      foo: 'bar',
    });

    // @ts-ignore
    expect(pool._stack).toEqual([]);
  });
});

describe('error states in non-prod', () => {
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

describe('error states in prod', () => {
  // @ts-ignore
  const original = process.env.NODE_ENV;
  const originalConsole = console.error;

  const mockConsole = jest.fn();

  beforeEach(() => {
    // @ts-ignore
    process.env.NODE_ENV = 'production';

    console.error = mockConsole;
  });

  afterEach(() => {
    // @ts-ignore
    process.env.NODE_ENV = original;

    mockConsole.mockReset();

    console.error = originalConsole;
  });

  it('will throw when create is not a function', () => {
    // @ts-ignore
    expect(() => createNage({ create: 'foo' })).toThrow();
  });

  it('will not throw when onRelease is not a function', () => {
    // @ts-ignore
    expect(() => createNage({ onRelease: 'foo' })).not.toThrow();

    // @ts-ignore
    createNage({ onRelease: 'foo' });

    expect(mockConsole).toHaveBeenCalledTimes(2);
  });

  it('will not throw when onReserve is not a function', () => {
    // @ts-ignore
    expect(() => createNage({ onReserve: 'foo' })).not.toThrow();

    // @ts-ignore
    createNage({ onReserve: 'foo' });

    expect(mockConsole).toHaveBeenCalledTimes(2);
  });

  it('will not throw when onReset is not a function', () => {
    // @ts-ignore
    expect(() => createNage({ onReset: 'foo' })).not.toThrow();

    // @ts-ignore
    createNage({ onReset: 'foo' });

    expect(mockConsole).toHaveBeenCalledTimes(2);
  });

  it('will not throw an error if the entry being released is not from the pool', () => {
    const pool = createNage();

    expect(() => pool.release({})).not.toThrow();

    // @ts-ignore
    createNage([pool.release({})]);

    expect(mockConsole).toHaveBeenCalledTimes(2);
  });
});
