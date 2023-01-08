import {Encoder, Knob, LedButton, LedButtonStates, Slider, WeirdButton} from './';
import {compose, filter, lensPath, over, prop, propEq} from 'rambda';
import {error, log, setTimeout, clearTimeout} from '../utils';

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

const controlState: {[key: string]: ControlState} = {};

export class Control {

    public key: string;

    constructor(public note: number, public channel: number = 1) {
        this.key = `${this.channel}-${this.note}`
    }

    setState(state: LedButtonStates): void {};

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
        return
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
        if (!controlState[this.key]) {
            return;
        }
        switch (typeof callback) {
            case 'number':
                this.unsubscribe(this.key, 'token', callback);
                // controlState[this.key].subscriptions = filter(propEq('token', callback), controlState[this.key].subscriptions);
                break;
            case 'function':
                this.unsubscribe(this.key, 'callback', callback);
                // controlState[this.key].subscriptions = filter(propEq('callback', callback), controlState[this.key].subscriptions);
                break;
            case 'undefined':
            default:
                controlState[this.key].subscriptions = [];
        }
    }

    static onMidi = (status: number, channel: number, note: number, velocity: number): void => {
        const key = `${channel}-${note}`;
        const control = controlState[key];
        const now = Date.now();
        if (control && control.usesPress) {
            if (isNoteOn(status)) {
                control.lastPress = now;
                clearTimeout(control.timeoutId);
                control.timeoutId = null;
                control.timeoutId = setTimeout(() => {
                    this.triggerSubscribers(control, ({ event }) => event.event === 'hold')(status, channel, note, velocity)
                }, 100);
            }
            else if (isNoteOff(status)) {
                clearTimeout(control.timeoutId);
                if (now - control.lastPress < 100) {
                    this.triggerSubscribers(control, ({ event }) => event.event === 'press')(status, channel, note, velocity)
                } else {
                    this.triggerSubscribers(control, ({ event }) => event.event === 'release')(status, channel, note, velocity)
                }
            }
        }
        if (control) {
            this.triggerSubscribers(control,
                ({ event }) =>
                       (isNoteOn(status) && event.event === 'noteOn')
                    || (isNoteOff(status) && event.event === 'noteOff')
                    || (isChannelController(status) && event.event === 'cc')
            )(status, channel, note, velocity)
        }
    }

    static triggerSubscribers = (control: ControlState, predicate: (x: any) => boolean) => (status: number, channel: number, note: number, velocity: number) => {
        control.subscriptions.forEach((event: Subscription) => {
            if (predicate({ event, status, channel, note, velocity })) {
                event.callback({
                    target: this,
                    event: event.event,
                    status,
                    channel,
                    note,
                    velocity,
                });
            }
        });
    }
}