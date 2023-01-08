import {log} from '../utils/utils';
import {MidiPort} from './MidiPort';
import MidiIn = com.bitwig.extension.controller.api.MidiIn;

export interface AppConstructorArgs {
    midi: MidiPort;
    numTracks: number;
    numSends: number;
    numScenes: number;
    numDrumPads: number;
}

export class App {

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

    // controllers: Controller[] = Array(16).fill(null);

    constructor({
        midi,
        numTracks = 8,
        numSends = 4,
        numScenes = 8,
        numDrumPads = 34
    }: AppConstructorArgs) {
        this.midi = midi;
        this.numTracks = numTracks;
        this.numSends = numSends;
        this.numScenes = numScenes
        this.numDrumPads = numDrumPads;
        // this.init();
    }

    init() {
        log('inside: app:init here', null);
        this.app = host.createApplication();
        this.transport = host.createTransport();
        // this.groove = host.createGroove();
        // this.trackBank = host.createTrackBank(this.numTracks, this.numSends, this.numScenes);
        // this.sceneBank = this.trackBank.sceneBank();
        // this.cursorClip = host.createLauncherCursorClip(1, 1);
        // this.cursorTrack = host.createCursorTrack('Primary', 'Primary', 0, 0, true);
        // // this.cursorDevice = this.cursorTrack.createCursorDevice('Primary', 'Primary', 0, API.CursorDeviceFollowMode.FIRST_DEVICE)
        // // this.cursorRemote = this.cursorDevice.createCursorRemoteControlsPage(8);
        // // test
        // // These are for Drum mode.
        // // this.cursorTrackFirstDevice = this.cursorTrack.createCursorDevice("First Device", "First Device", 0, API.CursorDeviceFollowMode.FIRST_DEVICE);
        // // this.cursorDrumPadBank = this.cursorTrackFirstDevice.createDrumPadBank(this.numDrumPads);
        // this.prefs = host.getPreferences();
        // this.controllers.forEach(controller => controller && controller.setApp(this));
        log('inside: after:app:init here', null);
    }

    initControllers() {

    }

    destroy() {
        // this.controllers.forEach(controller => controller && controller.destroy());
    }

    flush() {
        // this.controllers.forEach(controller => controller && controller.flush());
    }

    addController(controller: any) {
        // controller.setApp(this);
        // this.controllers[controller.channel] = controller;
    }

    initMidi() {
        log('before:app:initMidi', null);
        this.midiDawOut = host.getMidiOutPort(0);
        this.midiNotesOut = host.getMidiOutPort(1);

        // Setup Input Ports.
        let midiDawIn = host.getMidiInPort(0);
        let midiNotesIn = host.getMidiInPort(1);



        midiDawIn.setMidiCallback(this.midiCallback);
        midiDawIn.setSysexCallback(this.sysexCallback);

        log('after:app:initMidi', null);
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