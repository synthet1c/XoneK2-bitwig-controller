import {Control} from './Control';

export class Potentiometer extends Control {
    constructor(public note: number, public channel: number = 1) {
        super(note, channel);
    }

    clone(channel: number) {
        return new Potentiometer(this.note, channel);
    }
}


export class Knob extends Control {
    constructor(public note: number, public channel: number = 1) {
        super(note, channel);
    }

    clone(channel: number) {
        return new Knob(this.note, channel);
    }
}


export class Slider extends Potentiometer {
    constructor(public note: number, public channel: number = 1) {
        super(note, channel);
    }

    clone(channel: number) {
        return new Slider(this.note, channel);
    }
}