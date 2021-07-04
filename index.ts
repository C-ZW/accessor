
/**
 * Todo implement get, set, delete and optional serialize, deserialize.
 * Data will serialize before set if defined, and deserialize after get if defined.
 * 
 */
export interface Accessible {
    get: (key: string) => any | undefined | Promise<any | undefined>;
    set: (key: string, value: any, ttl?: number) => any | Promise<any>;
    delete: (key: string) => any | Promise<any>;
    serialize?: (data: any) => any;
    deserialize?: (serializeData: any) => any;
}

export interface AccessorOptions { strict?: boolean }

export class Accessor implements Accessible {
    private accessors: Accessible[];
    private options: AccessorOptions;

    /**
     * Retrieving data preference accessors order.
     * 
     * 
     * @param accessors 
     * @param options.strict strict near first order when set and sync data
     */
    constructor(accessors: Accessible[], options?: AccessorOptions) {
        this.accessors = accessors;
        this.options = options ?? {};
    }

    /**
     * Get most near data from accessor.
     * 
     * @param key 
     * @returns 
     */
    async get(key: string): Promise<string | undefined> {
        for (const accessor of this.accessors) {
            const data = await accessor.get(key);
            if (data !== undefined) {
                return this.callbackOn(data, accessor.deserialize);
            }
        }
        return undefined;
    }

    /**
     * set data to accessors
     * 
     * @param key 
     * @param value 
     * @param ttl 
     */
    async set(key: string, value: any, ttl?: number | undefined): Promise<void> {
        for (const accessor of this.accessors) {
            const data = this.callbackOn(value, accessor.serialize);
            if (this.options?.strict) {
                await accessor.set(key, data, ttl);
            } else {
                accessor.set(key, data, ttl);
            }
        }
    }

    /**
     * Delete data from accessor
     * 
     * @param key 
     */
    delete(key: string): void {
        for (const accessor of this.accessors) {
            accessor.delete(key);
        }
    }

    /**
     * sync data with the last one accessor
     * @param key 
     */
    async sync(key: string): Promise<void> {
        const data = await this.getLastAccessorData(key);
        await this.set(key, data);
    }

    private async getLastAccessorData(key: string) {
        return await this.accessors[this.accessors.length - 1].get(key);
    }

    private callbackOn(data: any, fn?: ((data: any) => any)) {
        return fn ? fn(data) : data;
    }
}
