import {Control} from '../controls';
import {isObject, over} from './helpers';
import {Observable, Subject} from 'rxjs';

export function alert(msg: string) {
    host.showPopupNotification(msg);
}

export const log = (tag: string, value: any) => {
    if (typeof value === 'undefined') {
        return (_value: any) => log(tag, value);
    }
    println(`--> ${tag}: ${JSON.stringify(value, convertControlToLog, 2)}`);
    // println(`--> ${tag}`);
}

export const error = (tag: string, value: any) => {
    if (typeof value === 'undefined') {
        return (_value: any) => error(tag, value);
    }
    host.errorln(`xxxxxxxxxxxx --> ${tag}: ${JSON.stringify(value, convertControlToLog, 2)}`);
    // host.errorln(`xxxxxxxxxxxx --> ${tag}`);
}

export const trace = (tag: string) => (value: any) => {
    log(tag, value);
    return value;
}

export const traceError = (tag: string) => (value: any) => {
    error(tag, value);
    return value;
}

const convertControlToLog = (key: string, value: Control | any) => {
    if (value instanceof Control) {
        return `Control(${value.channel}, ${value.note})`;
    }
    if (value instanceof Subject) {
        return 'Subject()';
    }
    if (value instanceof Observable) {
        return 'Observable()';
    }
    return value;
}