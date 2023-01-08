import TrackBank = com.bitwig.extension.controller.api.TrackBank;
import CursorTrack = com.bitwig.extension.controller.api.CursorTrack;
import {applySpec, path, prop} from 'rambda';
import {AMBER, Control, GREEN, LedButtonStates, OFF, RED} from '../controls';
import {ChannelControls, Controls} from '../Configuration';
import {log} from '../utils/utils';
import {preferences} from '../XoneK2.control';
import Track = com.bitwig.extension.controller.api.Track;

export interface MixerControls {
    indicator: Control;
    mute: Control;
    a: Control;
    b: Control;
    solo: Control;
    volume: Control;
    send1: Control;
    send2: Control;
}

export default class MixerLayer {

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
        select: path([deck, 'matrix', this.matrix[2][offset]]),
        solo: path([deck, 'matrix', this.matrix[3][offset]]),
        volume: path([deck, 'sliders', this.matrix[0][offset]]),
        send1: path([deck, 'column', offset + 1, 'KNOB_1']),
        send2: path([deck, 'column', offset + 1, 'KNOB_2']),
    })(ChannelControls)

    private handleAllTracks = () => ({
        mute: this.handleMute,
        solo: this.handleSolo,
        volume: this.handleVolume,
        select: this.handleSelect,
        a: this.testControlPressAndRelease,
        indicator: this.handleTrackTypeIndicator
    })

    private handleAudioTracks = () => ({
        send1: this.handleSend1,
        send2: this.handleSend2,
    })

    constructor(private trackBank: TrackBank, private cursorTrack: CursorTrack) {
        this.init();
    }

    init() {
        this.handleEncoder(ChannelControls.A.encoder);
        this.handleScroll(ChannelControls.A.scroll);
        for (let i = 0; i < this.trackBank.getSizeOfBank(); i++) {
            const track = this.trackBank.getItemAt(i);
            const controls = this.controls[i];
            for (const [key, handler] of Object.entries(this.handleAllTracks())) {
                handler(prop(key, controls), track, i);
            }
        }
    }

    private handleMute = (control: Control, track: Track, i: number) => {
        control.on('noteOn', (e: any) => {
            track.mute().toggle();
        });
        track.mute().addValueObserver((muted) => {
            control.setState(muted ? RED : GREEN);
        });
    }

    private handleSolo = (control: Control, track: Track, i: number) => {
        control.on('noteOn', (e: any) => {
            track.solo().toggle(false);
        });
        track.solo().addValueObserver((muted) => {
            control.setState(muted ? AMBER : OFF);
        });
    }

    private handleSelect = (control: Control, track: Track, i: number) => {
        control.on('noteOn', (e: any) => {
            track.selectInMixer();
        });
        // note: need to figure out select watcher
    }

    private handleVolume = (control: Control, track: Track, i: number) => {
        control.on('cc', (e: any) => {
            track.volume().set(Math.min(preferences.mixer.maxVolume, e.velocity), 128);
        });
    }

    private handleSend1 = (control: Control, track: Track, i: number) => {
        const send = track.getSend(0);
        control.on('cc', (e: any) => {
            send.set(e.velocity, 128);
        });
    }

    private handleSend2 = (control: Control, track: Track, i: number) => {
        const send = track.getSend(1);
        control.on('cc', (e: any) => {
            send.set(e.velocity, 128);
        });
    }

    private handleTrackTypeIndicator = (control: Control, track: Track, i: number) => {
        const trackType = track.trackType();
        trackType.addValueObserver((trackType) => {
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
        });
    }

    private handleEncoder = (control: Control) => {
        control.on('cc', (e) => {
            if (e.velocity < 64) {
                this.cursorTrack.selectParent();
            } else {
                this.cursorTrack.selectFirstChild();
            }
        });
    }

    private handleScroll = (control: Control) => {
        control.on('cc', (e) => {
            const scroll = e.velocity < 64 ? 1 : -1;
            this.trackBank.scrollBy(scroll);
        });
    }

    private testControlPressAndRelease = (control: Control, track: Track) => {
        let toggle = false;
        control.setState(LedButtonStates.AMBER);
        control.on('hold', (event) => {
            log('on:hold', event);
            control.setState(LedButtonStates.RED);
        });
        control.on('release', (event) => {
            log('on:release', event);
            control.setState(toggle ? LedButtonStates.GREEN : LedButtonStates.AMBER);
        });
        control.on('press', (event) => {
            log('on:press', event);
            toggle = !toggle;
            control.setState(toggle ? LedButtonStates.GREEN : LedButtonStates.AMBER);
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