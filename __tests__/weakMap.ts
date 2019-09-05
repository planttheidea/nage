/* globals describe,expect,it */

import { WeakMapPolyfill } from '../src/weakMap';

describe('polyfill for WeakMap', () => {
  it('should create a map that stores reference to key', () => {
    const wm = new WeakMapPolyfill();

    const obj = {};
    const value = {};

    wm.set(obj, value);

    expect(wm.get(obj)).toBe(value);
    expect(wm.has(obj)).toBe(true);

    expect(wm.get(value)).toBe(undefined);
    expect(wm.has(value)).toBe(false);
  });

  it('should allow deletion from map', () => {
    const wm = new WeakMapPolyfill();

    const obj = {};
    const value = {};

    wm.set(obj, value);

    expect(wm.get(obj)).toBe(value);
    expect(wm.has(obj)).toBe(true);

    wm.delete(obj);

    expect(wm.get(obj)).toBe(undefined);
    expect(wm.has(obj)).toBe(false);
  });

  it('should throw if constructed with a non-object', () => {
    const wm = new WeakMapPolyfill();

    // @ts-ignore - testing invalid objects
    expect(() => wm.set('foo', 'bar')).toThrow();
  });
});
