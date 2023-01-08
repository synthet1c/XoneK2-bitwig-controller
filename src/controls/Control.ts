import {Encoder, Knob, LedButton, LedButtonStates, Slider, WeirdButton} from './';

export type ControlType = Control | WeirdButton | Knob | Slider | Encoder | LedButton

export class Control {

    constructor(public cc: number, public channel: number = 1) {}

    setState(state: LedButtonStates): void {};

    clone(channel: number): ControlType {
        let newObject = null;
        if (this instanceof WeirdButton) {
            newObject = new WeirdButton(this.cc, channel);
        } else if (this instanceof Knob) {
            newObject = new Knob(this.cc, channel);
        } else if (this instanceof Slider) {
            newObject = new Slider(this.cc, channel);
        } else if (this instanceof Encoder) {
            newObject = new Encoder(this.cc, channel);
        } else if (this instanceof LedButton) {
            newObject = new LedButton(this.cc, channel);
        } else {
            newObject = new Control(this.cc, channel);
        }
        // Object.assign(newObject, object);
        return newObject;
    }

    // onNoteOn(cb: ({ status: number, channel: number, note: number, velocity: number}) => void) {
    //    cb({
    //        status,
    //        channel,
    //        note,
    //        velocity,
    //    });
    // }
}