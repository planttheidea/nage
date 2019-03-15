/* globals afterEach,beforeEach,describe,expect,it */

import createNage from '../src';
import Nage from '../src/Nage';

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
  });

  it('will reserve an object', () => {
    const pool = createNage();

    const object = pool.reserve();

    expect(pool.stack).toEqual([]);
    expect(pool.size).toEqual(0);

    expect(object).toEqual({});
  });

  it('will release a reserved object', () => {
    const pool = createNage();

    const object = pool.reserve();

    pool.release(object);

    expect(pool.stack).toEqual([object]);
    expect(pool.size).toEqual(1);
  });

  it('will clear the pool of objects', () => {
    const pool = createNage();

    const object = pool.reserve();

    pool.release(object);

    pool.clear();

    expect(pool.stack).toEqual([]);
    expect(pool.size).toEqual(0);
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

  it('will throw an error if the entry being released is not from the pool', () => {
    const pool = createNage();

    expect(() => pool.release({})).toThrow();
  });
});
