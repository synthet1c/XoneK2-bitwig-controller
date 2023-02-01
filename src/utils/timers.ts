import {error, log} from './';

export interface Timer {
    token: number;
    start: number;
    elapsed: number;
    duration: number;
    precision: number;
}

let timers: number[] = [];
let timerId = 0;

export function setTimeout(cb: (timer: Timer) => void, delay: number) {
    const token = ++timerId;
    const start = Date.now();
    timers.push(token);
    log('setTimeout:init', token);
    host.scheduleTask(() => {
        log('scheduleTask:called', token);
        if (timers.indexOf(token) === -1) {
            log('scheduleTask:cancelled', token);
            return;
        }
        const elapsed = Date.now() - start;
        cb({
            start,
            elapsed,
            duration: elapsed,
            token,
            precision: elapsed / delay,
        });
        error('setTimeout:called', timers);
    }, delay)
    return timerId
}
// @ts-ignore
global.setTimeout = setTimeout;

export function clearTimeout(timerId: number) {
    const index = timers.indexOf(timerId);
    log('clearTimeout:before', timers);
    if (index > -1) {
        timers.splice(index, 1);
    }
    log('clearTimeout:after', timers);
}

export interface Interval {
    token: number;
    start: number;
    duration: number;
    elapsed: number;
    count: number;
    precision: number;
}

let intervals: number[] = [];
let intervalId = 0;

export function setInterval<T>(cb: (interval: Interval) => void, delay: number) {
    let token = ++intervalId;
    const start = Date.now();
    let last: number = start;
    let count: number = 0;
    intervals.push(token);
    const _setInterval = (cb: (interval: Interval) => void, delay: number) => {
        host.scheduleTask(() => {
            if (intervals.indexOf(token) === -1) {
                return;
            }
            const now = Date.now();
            const duration = now - last;
            cb({
                token,
                start,
                count: ++count,
                duration,
                elapsed: now - start,
                precision: duration / delay,
            });
            last = now;
            _setInterval(cb, delay);
        }, delay);
    }
    _setInterval(cb, delay);
    return token;
}

export function clearInterval(token: number) {
    const index = intervals.indexOf(token);
    if (index > -1) {
        intervals.splice(index, 1);
    }
}