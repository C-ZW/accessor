# Accessor

Defined multi-level data store and access by near first.

* Get near first data

* Set and delete at same time

* Accessor implement Accessible can be a member of others Accessor

* Easy to use

## Installation

```bash
npm install @c-zw/accessor
```

## API

### constructor(accessors: Accessible[], options?: AccessorOptions)

```ts
interface AccessorOptions { 
    strict?: boolean // strict near first order when set, sync data
}
```

## Accessible interface

```ts
export interface Accessible {
    get: (key: string) => any | undefined | Promise<any | undefined>;
    set: (key: string, value: any, ttl?: number) => any | Promise<any>;
    delete: (key: string) => any | Promise<any>;
    serialize?: (data: any) => any;
    deserialize?: (serializeData: any) => any;
}
```

## Example

### use Map

```ts
async function test1() {
    const localCache = new Map();
    const localCache2 = new Map();
    const localCache3 = new Map();
    const accessor = new Accessor([localCache, localCache2, localCache3]);

    accessor.set('1', 1);
    console.log(`accessor get key 1: ${await accessor.get('1')}`);
    console.log(`localCache get key 1: ${localCache.get('1')}`);
    console.log(`localCache2 get key 1: ${localCache2.get('1')}`);
    console.log(`localCache3 get key 1: ${localCache3.get('1')}`);
}

test1();

// accessor get key 1: 1
// localCache get key 1: 1
// localCache2 get key 1: 1
// localCache3 get key 1: 1
```

### Customize defined

```ts
class LocalCache<T> implements Accessible {
    map: Map<string, T>;

    constructor() {
        this.map = new Map();
    }

    get(key: string) {
        return this.map.get(key);
    }

    set(key: string, value: T) {
        this.map.set(key, value);
    }

    delete(key: string) {
        this.map.delete(key);
    }

    serialize(data: any) {
        return JSON.stringify(data)
    }

    deserialize(data: any) {
        return JSON.parse(data);
    }
}
```

Use it