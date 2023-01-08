import TrackBank = com.bitwig.extension.controller.api.TrackBank;
import CursorTrack = com.bitwig.extension.controller.api.CursorTrack;
import {applySpec, path} from 'rambda';
import {Control, LedButtonStates} from '../controls';
import {ChannelControls, Controls} from '../Configuration';
import {log} from '../utils/utils';
import {preferences} from '../XoneK2.control';

export interface MixerControls {
    indicator: Control;
    mute: Control;
    a: Control;
    b: Control;
    solo: Control;
    volume: Control;
    reverb: Control;
    delay: Control;
}

export default class MixerLayer {

    private verticalMatrix = [
        ['A', 'E', 'I', 'M'],
        ['B', 'F', 'J', 'N'],
        ['C', 'G', 'K', 'O'],
        ['D', 'H', 'L', 'P'],
    ]

    private matrix = [
        ['A', 'B', 'C', 'D'],
        ['E', 'F', 'G', 'H'],
        ['I', 'J', 'K', 'L'],
        ['M', 'N', 'O', 'P'],
    ]

    private getMixerControls = (deck: string, offset: number) => applySpec<MixerControls>({
        indicator: path<Control>([deck, 'encoderLeds', offset + 1]),
        mute: path<Control>([deck, 'matrix', this.matrix[0][offset]]),
        a: path<Control>([deck, 'matrix', this.matrix[1][offset]]),
        b: path<Control>([deck, 'matrix', this.matrix[2][offset]]),
        solo: path<Control>([deck, 'matrix', this.matrix[3][offset]]),
        volume: path<Control>([deck, 'sliders', this.matrix[0][offset]]),
        reverb: path<Control>([deck, 'column', offset + 1, 'KNOB_1']),
        delay: path<Control>([deck, 'column', offset + 1, 'KNOB_2']),
    })(ChannelControls)

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

    constructor(private trackBank: TrackBank, private cursorTrack: CursorTrack) {
        this.initTrackBank();
        this.initObservers();
    }


    initTrackBank() {

        for (let i = 0; i < this.trackBank.getSizeOfBank(); i++) {
            const track = this.trackBank.getItemAt(i);

            const trackType = track.trackType();
            trackType.addValueObserver((trackType) => {
                log('trackType', trackType);
                this.setTrackTypeIndicator(this.controls[i], trackType);
            });

            const isGroup = track.isGroup();
            isGroup.addValueObserver((isGroup) => log('isGroup', isGroup));

            const trackCursor = track.createCursorDevice();

            trackCursor.deviceType().addValueObserver((deviceType) => {
                log('trackCursor', deviceType);
            });

            // const drumPadBank = trackCursor.createDrumPadBank(16);
            // drumPadBank.

            const v = track.volume();
            v.markInterested();
            v.setIndication(true);

            const s = track.solo();
            s.markInterested();

            const m = track.mute();
            m.markInterested();
        }
    }

    setTrackTypeIndicator(control: MixerControls, trackType: string) {
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
        control.indicator.setState(state);
    }

    initObservers() {
        for (let i = 0; i < this.trackBank.getSizeOfBank(); i++) {
            const control = this.controls[i];
            this.trackBank.getItemAt(i).mute().addValueObserver((muted) => {
                control.mute.setState(muted ? LedButtonStates.RED : LedButtonStates.GREEN);
            });
            this.trackBank.getItemAt(i).solo().addValueObserver((solo) => {
                control.solo.setState(solo ? LedButtonStates.AMBER : LedButtonStates.OFF);
            });

        }
    }

    onMidi = (status: number, channel: number, note: number, velocity: number): void => {
        log('channel', channel);
        if (note === Controls.scroll.cc) {
            // const scroll = velocity < 64 ? 1 : -1;
            if (velocity < 64) {
                this.trackBank.scrollBackwards();
            } else {
                this.trackBank.scrollForwards();
            }
            // this.trackBank.scrollBy(scroll);
            return;
        }
        if (note === Controls.encoder.cc) {
            // const scroll = velocity < 64 ? 1 : -1;
            if (velocity < 64) {
                this.cursorTrack.selectParent();
            } else {
                this.cursorTrack.selectFirstChild();
            }
            // this.trackBank.scrollBy(scroll);
            return;
        }
        for (let i = 0; i < this.trackBank.getSizeOfBank(); i++) {
            const control = this.controls[i];
            const track = this.trackBank.getItemAt(i);
            const reverb = track.getSend(0);
            const delay = track.getSend(1);
            if (isNoteOn(status)) {
                if (note === control.mute.cc && channel === control.mute.channel) {
                    track.mute().toggle();
                }
                if (note === control.solo.cc && channel === control.solo.channel) {
                    track.solo().toggle(false);
                }
                if (note === control.b.cc && channel === control.b.channel) {
                    track.selectInMixer();
                }
            }
            if (isChannelController(status)) {
                // log('isChannelController', control.volume);
                if (note === control.volume.cc && channel === control.volume.channel) {
                    track.volume().set(Math.min(preferences.mixer.maxVolume, velocity), 128);
                }
                if (note === control.reverb.cc && channel === control.reverb.channel) {
                    reverb.set(velocity, 128);
                }
                if (note === control.delay.cc && channel === control.delay.channel) {
                    delay.set(velocity, 128);
                }
            }
        }

    }
}