import {error, log} from './';

let timers: number[] = [];
let timerId = 0;
export function setTimeout(cb: () => void, delay: number) {
    const id = ++timerId;
    timers.push(id);
    log('setTimeout:init', timers);
    host.scheduleTask(() => {
        log('scheduleTask:called', id);
        if (timers.indexOf(id) === -1) {
            log('scheduleTask:cancelled', id);
            return;
        }
        cb();
        error('setTimeout:called', timers);
    }, delay)
    return timerId
}

export function clearTimeout(timerId: number) {
    const index = timers.indexOf(timerId);
    log('clearTimeout:before', timers);
    if (~index) {
        timers.splice(index, 1);
    }
    log('clearTimeout:after', timers);
}

export function setInterval<T>(cb: () => void, delay: number) {
    host.scheduleTask(cb, delay);
}