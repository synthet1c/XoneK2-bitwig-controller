import MidiIn = com.bitwig.extension.controller.api.MidiIn;
import MidiOut = com.bitwig.extension.controller.api.MidiOut;
import {error, getChannel, log} from '../utils';
import {Control, MidiEvent, controlsMap} from '../controls';
import {Subject} from 'rxjs';

export interface MidiPortConfiguration {
    numInPorts: number;
    numOutPorts: number;
    input: string;
    output: string;
}

export type MidiCallback = (status: number, note: number, velocity: number) => void;

export class MidiPort {

    public midi$ = new Subject<MidiEvent>();
    public onNoteOn$ = new Subject<MidiEvent>();
    public onNoteOff$ = new Subject<MidiEvent>();
    public onCC$ = new Subject<MidiEvent>();
    public input: MidiIn;
    public output: MidiOut;
    private numInPorts: number;
    private numOutPorts: number;
    private inputName: string;
    private outputName: string;

    constructor({ numInPorts, numOutPorts, input, output }: MidiPortConfiguration) {
        this.numInPorts = numInPorts;
        this.numOutPorts = numOutPorts;
        this.inputName = input;
        this.outputName = output;
        this.init();
    }

    init() {

        if (host.platformIsWindows()) {
            host.addDeviceNameBasedDiscoveryPair([this.inputName], [this.outputName]);
        } else if (host.platformIsMac()) {
            host.addDeviceNameBasedDiscoveryPair([this.inputName], [this.outputName]);
        } else if (host.platformIsLinux()) {
            host.addDeviceNameBasedDiscoveryPair([this.inputName], [this.outputName]);
        }

        this.input = host.getMidiInPort(0);
        this.output = host.getMidiOutPort(0);

        this.input.setMidiCallback((status: number, note: number, velocity: number) => {
            const channel = getChannel(status);
            const midiMessage: MidiEvent = { status, channel, note, velocity };
            const key = `${channel}-${note}`
            const control = controlsMap[key];
            if (!control) {
                throw Error(`Control not mapped channel: ${channel}, note: ${note}`);
            }
            this.midi$.next(midiMessage);
            control.onMidi$.next(midiMessage);
            switch (true) {
                case isNoteOn(status):
                    this.onNoteOn$.next(midiMessage);
                    control.onNoteOn$.next(midiMessage);
                    break;
                case isNoteOff(status):
                    this.onNoteOff$.next(midiMessage);
                    control.onNoteOff$.next(midiMessage);
                    break;
                case isChannelController(status):
                    this.onCC$.next(midiMessage);
                    control.onCC$.next(midiMessage);
                    break;
            }
        });
    }
}