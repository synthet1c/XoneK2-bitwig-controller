import {Control, LedButton} from '../controls';


export function isObject(possibleObject: any): boolean {
    return typeof possibleObject === 'object' && possibleObject !== null;
}

export function channelify(controls: any, channel: number, acc: any = {}) {
    for (const [key, value] of Object.entries(controls)) {
        // log('key', key);
        if (isObject(value)) {
            acc[key] = channelify(value, channel, {});
        }
        if (value instanceof Control) {
            acc[key] = value.clone(channel)
            continue;
        }

    }
    return acc;
}

export function over(object: any, callback: (value: any) => void): void {
    // log('over', object);
    for (const [key, value] of Object.entries(object)) {
        // log('key', key);
        if (value instanceof Control) {
            callback(value);
            continue;
        }
        if (isObject(value)) {
            over(value, callback);
        }
    }
}

export function flatMapLeds(object: any, acc : LedButton[] = []): LedButton[] {
    // log('over', object);
    for (const [key, value] of Object.entries(object)) {
        // log('key', key);
        if (value instanceof LedButton) {
            // log('LedButton', key);
            acc = acc.concat(value);
            continue;
        }
        if (isObject(value)) {
            acc = acc.concat(flatMapLeds(value, []));
        }
    }
    return acc;
}
