import {Control} from './Control';

export class Potentiometer extends Control {
    constructor(public cc: number, public channel: number = 1) {
        super(cc, channel);
    }
}

export class Knob extends Control {
    constructor(public cc: number, public channel: number = 1) {
        super(cc, channel);
    }
}

export class Slider extends Potentiometer {
    constructor(public cc: number, public channel: number = 1) {
        super(cc, channel);
    }
}