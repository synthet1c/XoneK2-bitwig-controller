import {Encoder, Knob, LedButton, LedButtonStates, Slider, WeirdButton} from './';
import {Subject, filter, map, tap, takeWhile, BehaviorSubject} from 'rxjs';
import {app} from '../XoneK2.control';
import {error, log, trace, traceError} from '../utils';
import {App} from '../classes/App';

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

export interface MidiEvent {
    status: number;
    channel: number;
    note: number;
    velocity: number;
}

export const controls: Control[] = [];
export const controlsMap: { [key: string]: Control } = {};

export class Control {

    public key: string;
    public onNoteOn$ = new Subject<MidiEvent>();
    public onNoteOff$ = new Subject<MidiEvent>();
    public onCC$ = new Subject<MidiEvent>();
    public onMidi$ = new Subject<MidiEvent>();
    public held$ = new Subject<boolean>();

    constructor(public note: number, public channel: number = 1) {
        this.key = `${this.channel}-${this.note}`
        controlsMap[this.key] = this;
        controls.push(this);
    }

    setState(state: LedButtonStates): void {};
    sendState(state: LedButtonStates): void {};

    clone(channel: number): ControlType {
        return new Control(this.note, channel);
    }

}