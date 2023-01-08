import Transport = com.bitwig.extension.controller.api.Transport;
import {error, log} from '../utils';
import {AMBER, Control, GREEN, LedButtonStates, OFF, RED} from '../controls';
import {ChannelControls} from '../Configuration';

export class TransportHandler {

    public transport: Transport = host.createTransport();
    private PLAY = ChannelControls.A.shift;

    constructor() {
        this.init();
    }

    play = () => this.transport.play();
    record = () => this.transport.record();
    stop = () => this.transport.stop();

    private handlePlay = (control: Control) => {
        control.on('noteOn', (e: any) => {
            this.transport.play();
        });
        this.transport.isPlaying().addValueObserver((playing) => {
            control.setState(playing ? GREEN : RED);
        });
    }

    init() {
        this.handlePlay(this.PLAY);
    }
}