import {Control} from './Control';

export class Button extends Control {
    constructor(public cc: number, public channel: number = 1) {
        super(cc, channel);
    }
}