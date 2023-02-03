import {log, trace} from '../utils';
import {MidiPort} from './MidiPort';
import MidiIn = com.bitwig.extension.controller.api.MidiIn;
import API = com.bitwig.extension.controller.api;
import {Subject} from 'rxjs';
import {MidiEvent} from '../controls';

export interface AppConstructorArgs {
    midi: MidiPort;
    numTracks: number;
    numSends: number;
    numScenes: number;
    numDrumPads: number;
}

export class App {

    midi$ = new Subject<MidiEvent>();
    app: API.Application;
    midi: MidiPort;
    midiDawOut: API.MidiOut;
    midiNotesOut: API.MidiOut;
    transport: API.Transport;
    groove: API.Groove;
    trackBank: API.TrackBank;
    sceneBank: API.SceneBank;
    cursorClip: API.Clip;
    cursorTrack: API.CursorTrack;
    drumCursorTrack: API.CursorTrack;
    drumEditorCursor: API.Clip;
    cursorDevice: API.CursorDevice;
    cursorTrackFirstDevice: API.PinnableCursorDevice;
    cursorRemote: API.CursorRemoteControlsPage;
    cursorDrumPadBank: API.DrumPadBank;
    prefs: API.Preferences;
    host = host;
    numTracks = 8;
    numSends = 4;
    numScenes = 8;
    numDrumPads = 64;

    constructor({
        midi,
        numTracks = 8,
        numSends = 2,
        numScenes = 8,
        numDrumPads = 8
    }: AppConstructorArgs) {
        this.midi = midi;
        this.numTracks = numTracks;
        this.numSends = numSends;
        this.numScenes = numScenes
        this.numDrumPads = numDrumPads;
        this.init();
    }

    init() {
        log('inside: app:init here', null);
        this.midi.midi$.subscribe(this.midi$);
        this.app = host.createApplication();
        this.transport = host.createTransport();
        // this.groove = host.createGroove();
        this.trackBank = host.createMainTrackBank(this.numTracks, this.numSends, this.numScenes);
        this.sceneBank = this.trackBank.sceneBank();
        this.cursorClip = host.createLauncherCursorClip(8, 4);
        this.cursorTrack = host.createCursorTrack('XONE_PRIMARY_CURSOR', 'Primary Track', 2, 4, true);
        this.cursorDevice = this.cursorTrack.createCursorDevice('XONE_PRIMARY_DEVICE', 'Primary Device', 0, API.CursorDeviceFollowMode.FIRST_DEVICE)
        this.cursorRemote = this.cursorDevice.createCursorRemoteControlsPage(8);

        // These are for Drum mode.
        this.drumCursorTrack = host.createCursorTrack('XONE_DRUM_CURSOR', 'Drum Cursor', 2, 0, true);
        this.cursorTrackFirstDevice = this.drumCursorTrack.createCursorDevice("XONE_DRUM_DEVICE", "Drum Device", 4, API.CursorDeviceFollowMode.FIRST_DEVICE);
        this.cursorDrumPadBank = this.cursorTrackFirstDevice.createDrumPadBank(this.numDrumPads);
        this.drumCursorTrack.selectFirstChild();

        this.drumEditorCursor = host.createLauncherCursorClip(16, 1);

        this.trackBank.followCursorTrack(this.cursorTrack);

        this.cursorTrackFirstDevice.deviceType().addValueObserver(trace('cursorFirstDevice'));
        this.cursorTrackFirstDevice.hasDrumPads().addValueObserver(trace('hasDrumPads'));
        this.drumCursorTrack.trackType().addValueObserver(trace('drumCursorTrack.trackType'));
        // this.prefs = host.getPreferences();
        // this.controllers.forEach(controller => controller && controller.setApp(this));
        log('inside: after:app:init here', null);
    }

    allowMidiNotesToPass = (midiNotesIn: MidiIn) => {
        // Create input channels for other Modes.
        midiNotesIn.createNoteInput("All Channels", "??????");
        for (let i = 0; i < 16; i++) {
            // Don't include these in the All Inputs, since All Channels exists there already.
            midiNotesIn.createNoteInput(`Channel ${i + 1}`, `?${i.toString(16)}????`).includeInAllInputs().set(false);
        }
    }

    midiCallback = (status: number, data1: number, data2: number) => {
        println(`<MidiCallback>\n  ${status}: ${data1}, ${data2}`);
    }


    sysexCallback = () => {

    }
}