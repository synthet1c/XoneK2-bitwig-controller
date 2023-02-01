import {Layer} from '../classes/Layer';

export function WhenActive<T = any>(stateName?: string) {
    return (
        target: any,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) => ({
        get(this: Layer) {
            const wrapperFn = (...args: any[]) => {
                if (this.active) {
                    return descriptor.value.apply(this, args);
                }
            }
            Object.defineProperty(this, key, {
                ...descriptor,
                value: wrapperFn,
            })
            return wrapperFn;
        }
    });
}