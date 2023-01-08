import {midi} from '../XoneK2.control';
import {Control} from './Control';
import {log} from '../utils/utils';

export enum LedButtonStates {
    RED = 'RED',
    AMBER = 'AMBER',
    GREEN = 'GREEN',
    OFF = 'OFF',
}

export interface LedButtonStateObject {
    [LedButtonStates.RED]: number,
    [LedButtonStates.AMBER]: number,
    [LedButtonStates.GREEN]: number,
    [LedButtonStates.OFF]: number,
}


export const RED = LedButtonStates.RED;
export const AMBER = LedButtonStates.AMBER;
export const GREEN = LedButtonStates.GREEN;
export const OFF = LedButtonStates.OFF;

export class LedButton extends Control {
    public modified = false;
    protected states: LedButtonStateObject;
    private previousState = 0;
    public state: any = null;
    private stateName: LedButtonStates = LedButtonStates.OFF;
    constructor(public note: number, public channel: number = 1) {
        super(note, channel);
        this.states = {
            [LedButtonStates.RED]: note,
            [LedButtonStates.AMBER]: note + (12 * 3),
            [LedButtonStates.GREEN]: note + (12 * 6),
            [LedButtonStates.OFF]: 0,
        }
        this.previousState = 0;
        this.modified = false;
        this.state = LedButtonStates.OFF;
    }

    setState(state: LedButtonStates): void {
        this.previousState = this.state;
        // @ts-ignore
        this.state = this.states[state];
        this.stateName = state;
        this.modified = true;
    }

    updateLED() {
        if (!this.modified || this.previousState === this.state) {
            return;
        }
        this.modified = false;
        if (this.state === 0) {
            midi.output.sendMidi(0x90 + (this.channel - 1), this.note, 0);
            return;
        }
        midi.output.sendMidi(0x90 + (this.channel - 1), this.state, 127);
    }
}


export class WeirdButton extends LedButton {
    constructor(note: number, channel: number = 1) {
        super(note, channel);
        this.states = {
            [LedButtonStates.RED]: note,
            [LedButtonStates.AMBER]: note + 4,
            [LedButtonStates.GREEN]: note + 8,
            [LedButtonStates.OFF]: 0,
        }
    }
}

