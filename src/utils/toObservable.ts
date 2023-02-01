import {ReplaySubject} from 'rxjs';

export function toObservable<T>(fn: any): ReplaySubject<T> {
    const subject = new ReplaySubject<T>(1);
    fn.addValueObserver((value: T) => subject.next(value));
    return subject;
}

export function observerToObservable<T>(fn: any): ReplaySubject<T> {
    const subject = new ReplaySubject<T>(1);
    fn((value: T) => subject.next(value));
    return subject;
}