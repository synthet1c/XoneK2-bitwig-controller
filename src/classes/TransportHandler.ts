import Transport = com.bitwig.extension.controller.api.Transport;
import {error, log, toObservable} from '../utils';
import {AMBER, Control, GREEN, LedButtonStates, OFF, RED, MidiEvent} from '../controls';
import {ChannelControls} from '../Configuration';
import {Subscription} from 'rxjs';

export class TransportHandler {

    public transport: Transport = host.createTransport();
    private PLAY = ChannelControls.A.shift;
    private subscriptions: Subscription[] = [];
    public playing$ = toObservable(this.transport.isPlaying())

    constructor() {
        this.init();
    }

    play = () => this.transport.play();
    record = () => this.transport.record();
    stop = () => this.transport.stop();

    private handlePlay = (control: Control) => {
        this.subscriptions.push(
            control.onNoteOn$.subscribe(this.play),
            this.playing$.subscribe((playing) => control.setState(playing ? GREEN : RED)),
        );
    }

    init() {
        this.handlePlay(this.PLAY);
    }

    deactivate() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
        this.subscriptions = [];
    }
}