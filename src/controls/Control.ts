import {Encoder, Knob, LedButton, LedButtonStates, Slider, WeirdButton} from './';
import {compose, filter, lensPath, over, prop, propEq} from 'rambda';
import {error, log, setTimeout, clearTimeout, isEventType, Timer} from '../utils';
import {ReplaySubject, Subject} from 'rxjs';

export type ControlType = Control | WeirdButton | Knob | Slider | Encoder | LedButton

interface ControlState {
    usesPress: boolean;
    subscriptions: Subscription[];
    lastPress: number;
    timeoutId: number;
}

interface Subscription {
    event: string;
    control: Control;
    callback: (e: any) => void;
    token: number;
}

export interface MidiMessageObject {
    status: number;
    channel: number;
    note: number;
    velocity: number;
}

export interface Event {
    target: Control,
    event: string,
    status: number,
    channel: number,
    note: number,
    velocity: number,
}

export interface SubscriptionPredicateObject extends MidiMessageObject {
   event: any;
}

const controlState: {[key: string]: ControlState} = {};
const controls: {[key: string]: Control} = {};

export class Control {

    public key: string;
    public onNoteOn$ = new Subject<Event>();
    public onNoteOff$ = new Subject<Event>();
    public onCC$ = new Subject<Event>();
    public onMidi$ = new Subject<Event>();

    constructor(public note: number, public channel: number = 1) {
        this.key = `${this.channel}-${this.note}`
        controls[this.key] = this;
    }

    setState(state: LedButtonStates): void {};
    sendState(state: LedButtonStates): void {};

    clone(channel: number): ControlType {
        switch (true) {
            case this instanceof WeirdButton:
                return new WeirdButton(this.note, channel);
            case this instanceof Knob:
                return new Knob(this.note, channel);
            case this instanceof Slider:
                return new Slider(this.note, channel);
            case this instanceof Encoder:
                return new Encoder(this.note, channel);
            case this instanceof LedButton:
                return new LedButton(this.note, channel);
        }
        return new Control(this.note, channel);
    }

    private subscriptionToken = 0;

    on = (event: string, callback: (e: any) => void) => {
        if (!controlState[this.key]) {
            controlState[this.key] = {
                usesPress: false,
                subscriptions: [],
                lastPress: Date.now(),
                timeoutId: null,
            }
        }
        controlState[this.key].usesPress = controlState[this.key].usesPress || event === 'press' || event === 'hold' || event === 'release'
        controlState[this.key].subscriptions.push({
            token: this.subscriptionToken++,
            event,
            control: this,
            callback,
        });
        return () => this.off(event, callback);
    }

    private unsubscribe = (id: string, key: string, token: (e: any) => void | number) =>
        compose(
            over(
                lensPath('subscriptions'),
                filter(propEq(key, token)),
            ),
            prop(id),
        )(controlState)


    off(event: string, callback?: (e: any) => void | number) {
        // log('off', { event, control: this });
        if (!controlState[this.key]) {
            return;
        }
        switch (typeof callback) {
            case 'number':
                this.unsubscribe(this.key, 'token', callback);
                break;
            case 'function':
                this.unsubscribe(this.key, 'callback', callback);
                break;
            case 'undefined':
            default:
                controlState[this.key].subscriptions = [];
        }
    }

    static onMidi = (status: number, channel: number, note: number, velocity: number): void => {
        const key = `${channel}-${note}`;
        const state = controlState[key];
        const control = controls[key];
        const now = Date.now();
        const midiMessage: MidiMessageObject = { status, channel, note, velocity };
        // log('onMidi', midiMessage);
        // if (state && state.usesPress) {
        //     if (isNoteOn(status)) {
        //         state.lastPress = now;
        //         clearTimeout(state.timeoutId);
        //         state.timeoutId = null;
        //         state.timeoutId = setTimeout((timer: Timer) => {
        //             this.triggerSubscribers(state, isEventType('hold'), midiMessage)
        //         }, 100);
        //     }
        //     else if (isNoteOff(status)) {
        //         clearTimeout(state.timeoutId);
        //         if (now - state.lastPress < 100) {
        //             this.triggerSubscribers(state, isEventType('press'), midiMessage)
        //         } else {
        //             this.triggerSubscribers(state, isEventType('release'), midiMessage)
        //         }
        //     }
        // }

        if (control) {
            const eventObj: Event = {
                target: null,
                event: 'noteOn',
                status,
                channel,
                note,
                velocity,
            };
            // target has a recursive error this hides it from the JSON parser
            Object.defineProperty(eventObj, 'target', {
                get() {
                    return control;
                },
            })
            switch (true) {
                case isNoteOn(status):
                    control.onNoteOn$.next(eventObj);
                    break;
                case isNoteOff(status):
                    control.onNoteOff$.next({ ...eventObj, event: 'noteOff' } as Event);
                    break;
                case isChannelController(status):
                    control.onCC$.next({ ...eventObj, event: 'cc' } as Event);
                    break;
            }
            control.onMidi$.next(eventObj);
        }

        if (state) {
            this.triggerSubscribers(state,
                ({ event }) =>
                       (isNoteOn(status) && event.event === 'noteOn')
                    || (isNoteOff(status) && event.event === 'noteOff')
                    || (isChannelController(status) && event.event === 'cc'), midiMessage)
        }
    }

    static triggerSubscribers = (control: ControlState, predicate: (a: SubscriptionPredicateObject) => boolean, midiMessage: MidiMessageObject) => {
        const { status, channel, note, velocity } = midiMessage;
        control.subscriptions.forEach((event: Subscription) => {
            if (predicate({ event, ...midiMessage })) {
                const eventObj: Event = {
                    target: null, // control.control
                    event: event.event,
                    status,
                    channel,
                    note,
                    velocity,
                };
                event.callback(eventObj);
            }
        });
    }

    match({ channel, note }: Partial<Event>) {
        return this.channel === channel && this.note === note;
    }
}