export class Subscriber {

}

export interface Observers {
    [name: string]:  API.SettableBooleanValue
}

export interface Subscribable {
    [name: string]: {
        cached: any,
        subscribers: Subscription[]
    }
}

export type Subscription = (value: any) => void;



export class PubSub {
    private events = {};
    private subscribers: Subscribable = {
        'transport.play': {
            cached: null,
            subscribers: [
                (value: any) => {println('playing');},
            ]
        }
    };

    constructor(observers: Observers) {
        for (const [key, observer] of Object.entries(observers)) {
            // @ts-ignore
            observer.addValueListener((value) => {
                const event = this.subscribers[key];
                if (value !== event.cached) {
                    event.subscribers.forEach((fn) => {
                        fn(value);
                    });
                }
            });
        }
    }
}
