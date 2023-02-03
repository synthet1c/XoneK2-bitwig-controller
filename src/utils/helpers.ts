import {Control, LedButton} from '../controls';
import {propEq} from 'rambda';
import {error, log} from './log';
import {Observable, Subject} from 'rxjs';

export const isEventType = propEq('event');

export const isObject = (possibleObject: any): boolean =>
    typeof possibleObject === 'object' && possibleObject !== null;

/**
 * Clone the Control and set the channel
 *
 * @param controls {GlobalControls}
 * @param channel {number}
 * @param acc {object}
 */
export function channelify(controls: any, channel: number, acc: any = {}) {
    function _channelify(controls: any, channel: number, acc: any = {}) {
        for (const [key, value] of Object.entries(controls)) {
            if (isObject(value) && !(value instanceof Observable)) {
                acc[key] = _channelify(value, channel, {});
            }
            if (value instanceof Control) {
                acc[key] = value.clone(channel)
                continue;
            }

        }
        return acc;
    }
    return _channelify(controls, channel, acc);
}

export function over(object: any, callback: (value: any) => void): void {
    for (const [key, value] of Object.entries(object)) {
        if (value instanceof Control) {
            callback(value);
            continue;
        }
        if (isObject(value) && !(value instanceof Observable)) {
            over(value, callback);
        }
    }
}

export function flatMapLeds(object: any, acc : LedButton[] = []): LedButton[] {
    for (const [key, value] of Object.entries(object)) {
        if (value instanceof LedButton) {
            acc = acc.concat(value);
            continue;
        }
        if (value instanceof Control) {
            continue;
        }
        if (isObject(value) && !(value instanceof Observable)) {
            acc = acc.concat(flatMapLeds(value, []));
        }
    }
    return acc;
}


export function getChannel(status: number): number {
    switch (true) {
        case isNoteOn(status):
            return status - 143;
        case isNoteOff(status):
            return status - 127;
        case isChannelController(status):
            return status - 175;
    }
}