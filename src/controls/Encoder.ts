import {Control} from './Control';

export class Encoder extends Control {
    constructor(
        public cc: number,
        public channel : number = 1
    ) {
        super(cc, channel);
    }
}