# nage

Efficient, tiny object pool

## Table of contents

- [Usage](#usage)
  - [Prerequisites](#prerequisites)
- [Typings](#typings)
- [Pool options](#pool-options)
  - [create](#create)
  - [initialSize](#initialsize)
  - [onReserve](#onreserve)
  - [onRelease](#onrelease)
- [Pool methods](#pool-methods)
  - [reserve](#reserve)
  - [release](#release)
  - [reset](#reset)
- [Pool values](#pool-values)
  - [size](#size)
- [Development](#development)

## Usage

```typescript
import nage from 'nage';

// create your pool
const pool = nage();

// reserve an object from the pool
const object = pool.reserve();

// do your logic

// release object back to the pool
pool.release(object);
```

#### Prerequisites

`WeakMap` must be available globally, either natively or through polyfill. This is used internally to allow for garbage collection of objects accidentally not released back into the pool.

## Typings

All typings are under the `Nage` namespace. The available types:

```typescript
type Entry = {
  [key: string]: any;
  [index: number]: any;
};

type Creator = () => Entry;

type Handler = (entry: Entry) => void;

type Options = {
  create?: Creator;
  initialSize?: number;
  onRelease?: Handler;
  onReserve?: Handler;
};
```

## Pool options

#### create

_defaults to () => ({})_

The method used to create a new object in the pool. The default returns an empty object, but if you have objects with a consistent structure it is more memory efficient to return an object with that structure to reduce the number of hidden classes created under-the-hood.

```typescript
const pool = nage({
  create() {
    return {
      name: null,
      target: null,
    };
  },
});
```

**NOTE**: This function must return an object of some kind. This can be a standard POJO, array, Map, Set, etc., but it cannot be a primitive or `null`.

#### initialSize

_defaults to 0_

```typescript
const pool = nage({ initialSize: 10 });
```

The number of objects to prepopulate the pool with. If you expect a number of objects to be used in parallel, it is advised to prepopulate the pool with the number appropriate for the use-case.

#### onReserve

```typescript
const pool = nage({
  onReserve(object: { [key: string]: any }) {
    object.reservedAt = Date.now();
  },
});
```

Handler called for a newly-reserved item from the pool, called with the object prior to being returned. This method is handy if you want to prepopulate the object with some data.

#### onRelease

```typescript
const pool = nage({
  onRelease(object: { [key: string]: any }) {
    for (const key in object) {
      object[key] = null;
    }
  },
});
```

Handler called for a newly-released item back into the pool, called with the object just prior to being added to the stack. This method is handy to perform cleanup of the object in preparation for future use.

## Pool methods

#### reserve

Reserves an object from the pool. If no objects remain to be reserved, it will create a new one for you based on the [`create`](#create) method from [options](#pool-options).

```typescript
const object = pool.reserve();
```

#### release

Releases an object back to the pool from where it came from.

```typescript
pool.release(object);
```

**NOTE**: If you pass an object that is not part of the pool, an error is thrown.

#### reset

Resets the pool to its initial state, which is based on the [`initialSize`](#initialsize) value from [options](#options).

## Pool values

#### size

The size of the current pool's stack, which represents the number of unused objects in the pool.

```typescript
console.log(pool.size); // 5
```

## Development

Standard stuff, clone the repo and `npm install` dependencies. The npm scripts available:

- `benchmark` => run the benchmark suite pitting `moize` against other libraries in common use-cases
- `build` => run rollup to build the distributed files in `dist`
- `clean` => run `rimraf` on the `dist` folder
- `dev` => run webpack dev server to run example app (playground!)
- `dist` => runs `clean` and `build`
- `lint` => runs ESLint against all files in the `src` folder
- `lint:fix` => runs `lint``, fixing any errors if possible
- `prepublish` => runs `compile-for-publish`
- `prepublish:compile` => run `lint`, `test:coverage`, and `dist`
- `test` => run test functions with `NODE_ENV=test`
- `test:coverage` => run `test` but with `nyc` for coverage checker
- `test:watch` => run `test`, but with persistent watcher
