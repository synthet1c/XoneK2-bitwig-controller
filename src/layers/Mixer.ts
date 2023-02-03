import TrackBank = com.bitwig.extension.controller.api.TrackBank;
import CursorTrack = com.bitwig.extension.controller.api.CursorTrack;
import {applySpec, path, prop} from 'rambda';
import {AMBER, Control, MidiEvent, GREEN, LedButtonStates, OFF, RED} from '../controls';
import {ChannelControls} from '../Configuration';
import {clearInterval, error, Interval, log, setInterval, trace, WhenActive} from '../utils';
import {preferences, trackBankHandler} from '../XoneK2.control';
import Track = com.bitwig.extension.controller.api.Track;
import {Layer} from '../classes/Layer';
import {App} from '../classes/App';
import {BehaviorSubject, ReplaySubject, Subscription} from 'rxjs';
import SettableBooleanValue = com.bitwig.extension.controller.api.SettableBooleanValue;

export interface MixerControls {
    indicator: Control;
    mute: Control;
    a: Control;
    select: Control;
    solo: Control;
    volume: Control;
    send1: Control;
    send2: Control;
}

export default class MixerLayer extends Layer {

    private trackBank: TrackBank;
    private cursorTrack: CursorTrack;
    public active = true;
    private destroy$ = new ReplaySubject<boolean>(1);
    private active$ = new BehaviorSubject<boolean>(false);
    private subscriptions: Subscription[] = [];

    private matrix = [
        ['A', 'B', 'C', 'D'],
        ['E', 'F', 'G', 'H'],
        ['I', 'J', 'K', 'L'],
        ['M', 'N', 'O', 'P'],
    ]

    private getMixerControls = (deck: string, offset: number) => applySpec<MixerControls>({
        indicator: path([deck, 'encoderLeds', offset + 1]),
        mute: path([deck, 'matrix', this.matrix[0][offset]]),
        a: path([deck, 'matrix', this.matrix[1][offset]]),
        select: path([deck, 'column', offset + 1, 'KNOB_1_BUTTON']),
        solo: path([deck, 'matrix', this.matrix[3][offset]]),
        volume: path([deck, 'sliders', this.matrix[0][offset]]),
        send1: path([deck, 'column', offset + 1, 'KNOB_1']),
        send2: path([deck, 'column', offset + 1, 'KNOB_2']),
    })(ChannelControls)

    constructor(app: App) {
        super(app);
        this.trackBank = app.trackBank;
        this.cursorTrack = app.cursorTrack;
    }

    activate() {
        error('activate', true);
        this.active = true;
        this.active$.next(true);
        this.destroy$ = new ReplaySubject<boolean>(1);

        this.initEvents();
        this.initTrackBank();
        log('activate:after', true);
    }

    deactivate() {
        log('mixer', 'deactivate');
        this.active = false;
        this.destroy$.next(true);
        this.destroy$.complete();
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.subscriptions = [];
        this.controls.forEach((channel) => {
            channel.indicator.setState(OFF);
            channel.mute.setState(OFF);
            channel.a.setState(OFF);
            channel.select.setState(OFF);
            channel.solo.setState(OFF);
        });
        super.deactivate();
    }

    initEvents = () => {
        this.subscriptions.push(
            ChannelControls.A.encoder.onCC$.subscribe(this.handleEncoder),
            ChannelControls.A.scroll.onCC$.subscribe(this.handleScroll),
        );
        for (let i = 0; i < this.trackBank.getSizeOfBank(); i++) {
            const track = this.trackBank.getItemAt(i);
            const controls = this.controls[i];

            this.subscriptions.push(
                controls.mute.onNoteOn$.subscribe(this.handleMute(controls.mute, track, i)),
                controls.solo.onNoteOn$.subscribe(this.handleSolo(controls.solo, track, i)),
                controls.select.onNoteOn$.subscribe(this.handleSelect(controls.select, track, i)),
                controls.volume.onCC$.subscribe(this.handleVolume(controls.volume, track, i)),
                controls.send1.onCC$.subscribe(this.handleSend1(controls.send1, track, i)),
                controls.send2.onCC$.subscribe(this.handleSend2(controls.send2, track, i)),
            )
        }
    }

    initTrackBank = () => {
        for (let i = 0; i < trackBankHandler.banks.length; i++) {
            const bank = trackBankHandler.banks[i];
            const track = this.trackBank.getItemAt(i);
            const controls = this.controls[i];

            this.subscriptions.push(
                bank.selected$.subscribe((muted) => controls.select.setState(muted ? GREEN : OFF)),
                bank.mute$.subscribe((muted) => controls.mute.setState(muted ? RED : GREEN)),
                bank.solo$.subscribe((solo) => controls.solo.setState(solo ? AMBER : OFF)),
                bank.trackType$.subscribe((trackType) => this.onTrackType(trackType, controls.indicator, track, i)),
            );
        }
    }

    private handleMute = (control: Control, track: Track, i: number) => (e: MidiEvent) => {
        track.mute().toggle();
    }

    private handleSolo = (control: Control, track: Track, i: number) => (e: MidiEvent) => {
        track.solo().toggle(false);
    }

    private handleSelect = (control: Control, track: Track, i: number) => (e: MidiEvent) => {
        track.selectInMixer();
    }

    private handleVolume = (control: Control, track: Track, i: number) => (e: MidiEvent) => {
        track.volume().set(Math.min(preferences.mixer.maxVolume, e.velocity), 128);
    }

    private handleSend1 = (control: Control, track: Track, i: number) => (e: MidiEvent) => {
        const send = track.getSend(0);
        send.set(e.velocity, 128);
    }

    private handleSend2 = (control: Control, track: Track, i: number) => (e: MidiEvent) => {
        const send = track.getSend(1);
        send.set(e.velocity, 128);
    }

    // @WhenActive('indicator')
    private onTrackType(trackType: string, control: Control, track: Track, i: number) {
        let state = LedButtonStates.OFF;
        switch (trackType) {
            case 'Instrument':
                state = LedButtonStates.GREEN;
                break;
            case 'Audio':
                state = LedButtonStates.AMBER;
                break;
            case 'Group':
                state = LedButtonStates.RED;
                break;
        }
        control.setState(state);
    }

    private handleEncoder = (e: MidiEvent) => {
        log('handleEncoder', e);
        if (e.velocity < 64) {
            this.cursorTrack.selectFirstChild();
        } else {
            this.cursorTrack.selectParent();
        }
    }

    private handleScroll = (e: MidiEvent) => {
        const scroll = e.velocity < 64 ? 1 : -1;
        this.trackBank.scrollBy(scroll);
    }

    private testControlPressAndRelease = (control: Control, track: Track) => {
        // let toggle = false;
        // control.setState(LedButtonStates.AMBER);
        // control.on('hold', (event: Event) => {
        //     log('on:hold', event);
        //     control.setState(LedButtonStates.RED);
        // });
        // control.on('release', (event: Event) => {
        //     log('on:release', event);
        //     control.setState(toggle ? LedButtonStates.GREEN : LedButtonStates.AMBER);
        // });
        // control.on('press', (event: Event) => {
        //     log('on:press', event);
        //     toggle = !toggle;
        //     control.setState(toggle ? LedButtonStates.GREEN : LedButtonStates.AMBER);
        // });
    }

    public testInterval = (control: Control) => {
        control.onNoteOn$.subscribe((e: MidiEvent) => {
            setInterval((interval: Interval) => {
                log('interval', interval);
                control.setState(interval.count % 2 ? RED : GREEN);
                if (interval.count >= 5) {
                    clearInterval(interval.token);
                }
            }, 100);
        });

    }

    private controls: MixerControls[] = [
        this.getMixerControls('A', 0),
        this.getMixerControls('A', 1),
        this.getMixerControls('A', 2),
        this.getMixerControls('A', 3),
        this.getMixerControls('B', 0),
        this.getMixerControls('B', 1),
        this.getMixerControls('B', 2),
        this.getMixerControls('B', 3),
        this.getMixerControls('C', 0),
        this.getMixerControls('C', 1),
        this.getMixerControls('C', 2),
        this.getMixerControls('C', 3),
        this.getMixerControls('D', 0),
        this.getMixerControls('D', 1),
        this.getMixerControls('D', 2),
        this.getMixerControls('D', 3),
    ]
}