import nage from '../src';

console.time();

const pool = nage({
  initialSize: 10000,
  name: 'My Special Pool',
  onRelease(item) {
    Object.keys(item).forEach((key) => {
      Reflect.deleteProperty(item, key);
    });
  },
});

console.timeEnd();

console.log(pool.name, pool);

const object1 = pool.reserve();

object1.foo = 'bar';

console.log(object1);
console.log(pool);

pool.release(object1);

console.log(pool);

// const used = [];

// for (let index = 0; index < 55; index++) {
//   used[index] = pool.reserve();

//   used[index].bar = `baz_${index}`;
// }

const used = pool.reserveN(55).map((entry, index) => {
  // eslint-disable-next-line no-param-reassign
  entry.bar = `baz_${index}`;

  return entry;
});

console.log(pool.size, used.map(entry => ({ ...entry })));

const toRelease = [];

for (let index = 0; index < 55; index++) {
  // pool.release(used[index]);

  toRelease.push(used[index]);
}

pool.releaseN(toRelease);

// @ts-ignore
console.log(pool.size, [...pool._stack]);

pool.reset();

// console.log(pool.size, pool);
