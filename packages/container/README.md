# emerald-js Container

A badly done DI container

# Usage

```js
const {Container, add, factory} = require("@emerald-js/container");
const c = new Container();

c.configure({
  'options': ['fireworks', 'cake'],
  // All functions are implied singletons
  'singleton': c => c.get('options'),
  // Factories will be executed everytime
  'factory': factory(c => c.get('options')),
});

console.log(c.get('options')); // => ['fireworks', 'cake']
console.log(c.get('singleton')); // => ['fireworks', 'cake']
console.log(c.get('factory')); // => ['fireworks', 'cake']

c.configure({
  'options': add('shaved ice')
});

console.log(c.get('options')); // => ['fireworks', 'cake', 'shaved ice']
console.log(c.get('singleton')); // => ['fireworks', 'cake']
console.log(c.get('factory')); // => ['fireworks', 'cake', 'shaved ice']

c.configure({
  'options': []
});

console.log(c.get('options')); // => []
console.log(c.get('singleton')); // => ['fireworks', 'cake']
console.log(c.get('factory')); // => []
```

# API

## `Container`

### `.add(name, values)`

Add values to array located on `name`, or will create a new array

Shorthand for `Container.define(name, add(values))`

### `.factory(name, factoryFunc)`

Add factory to Container

Shorthand for `Container.define(name, factory(factoryFunc))`

### `.singleton(name, factoryFunc)`

Add singleton factory to Container

### `.configure(keyValueObj)`

Adds all items in object to container, accepts modifiers like `.define`

### `.define(name, value)`

Add items to container by name, accepts modifiers

### `.get(name, ...args)` or `.make(name, ...args)`

Retrieve item from Container, args is also given to the factory function if applies

### `.g`

An object on which you can receive all items by a getter e.g.

```js
c.define('hello-world', 'yes')

c.g.helloWorld // => 'yes'
c.g['hello-world'] // => 'yes
```

## Modifiers

### `get(name, ...args)`

Will always fetch name from container with given args for this item

```js
c.define('test', factory((c, ...args) => console.log({ args })));
c.define('get_test', get('test', 'no no no'));

c.get('test', 'yes'); // => { args: ['no no no'] }
```

### `add(...items)`

If an array already exists, items will be added to it

### `alias(name)`

Will fetch `name` instead and keep arguments intact

### `factory(func)`

Will create a non-singleton factory

### `value(val)`

Will keep given value intact, helpful when you want to provide a function via the Container

