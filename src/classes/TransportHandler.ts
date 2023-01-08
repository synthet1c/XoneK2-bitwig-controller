import Transport = com.bitwig.extension.controller.api.Transport;
import {error, log} from '../utils/utils';
import {LedButtonStates} from '../controls';
import {ChannelControls} from '../Configuration';

export class TransportHandler {

    public transport: Transport = host.createTransport();
    private PLAY = ChannelControls.A.shift;

    constructor() {
        this.init();
        this.bindObservers();
    }

    play = () => this.transport.play();
    record = () => this.transport.record();
    stop = () => this.transport.stop();

    init() {
        this.transport.isPlaying().markInterested();
    }

    bindObservers() {
        this.transport.isPlaying().addValueObserver((isPlaying) => {
            error('playing', isPlaying);
            this.PLAY.setState(isPlaying ? LedButtonStates.GREEN : LedButtonStates.RED);
        });
    }


    onMidi = (status: number, channel: number, note: number, velocity: number): void => {
        if (isNoteOn(status)) {
            if (channel === this.PLAY.channel && note === this.PLAY.note) {
                this.transport.play();
            }
        }
    }
}