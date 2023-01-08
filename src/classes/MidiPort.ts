import MidiIn = com.bitwig.extension.controller.api.MidiIn;
import MidiOut = com.bitwig.extension.controller.api.MidiOut;
import {getChannel, log} from '../utils/utils';
import {Control} from '../controls';

export interface MidiPortConfiguration {
    numInPorts: number;
    numOutPorts: number;
    input: string;
    output: string;
}

export class MidiPort {
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
            Control.onMidi(status, channel, note, velocity);
        });
    }
}