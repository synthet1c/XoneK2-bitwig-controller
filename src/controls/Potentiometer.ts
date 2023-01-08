import {Control} from './Control';

export class Potentiometer extends Control {
    constructor(public note: number, public channel: number = 1) {
        super(note, channel);
    }
}

export class Knob extends Control {
    constructor(public note: number, public channel: number = 1) {
        super(note, channel);
    }
}

export class Slider extends Potentiometer {
    constructor(public note: number, public channel: number = 1) {
        super(note, channel);
    }
}