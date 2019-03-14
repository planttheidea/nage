import create from '../src';

const pool = create({
  onRelease(item) {
    for (const key in item) {
      Reflect.deleteProperty(item, key);
    }
  },
});

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

pool.clear();

console.log(pool.size, pool);
