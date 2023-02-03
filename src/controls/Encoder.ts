import {Control} from './Control';

export class Encoder extends Control {
    constructor(
        public note: number,
        public channel : number = 1
    ) {
        super(note, channel);
    }

    clone(channel: number) {
        return new Encoder(this.note, channel);
    }
}