import nage from '../src';

console.time();

const pool = nage({
  initialSize: 10000,
  onRelease(item) {
    Object.keys(item).forEach((key) => {
      Reflect.deleteProperty(item, key);
    });
  },
});

console.timeEnd();

console.log(pool);

const object1 = pool.reserve();

object1.foo = 'bar';

console.log(object1);
console.log(pool);

pool.release(object1);

console.log(pool);

const used = [];

for (let index = 0; index < 55; index++) {
  used[index] = pool.reserve();

  used[index].bar = `baz_${index}`;
}

console.log(pool.size, used.map(entry => ({ ...entry })));

for (let index = 0; index < 55; index++) {
  pool.release(used[index]);
}

console.log(pool.size, [...pool.stack]);

pool.reset();

// console.log(pool.size, pool);
