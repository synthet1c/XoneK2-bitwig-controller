import {Control} from './Control';

export class Button extends Control {
    constructor(public note: number, public channel: number = 1) {
        super(note, channel);
    }

    clone(channel: number) {
        return new Button(this.note, channel);
    }
}