import {TransportHandler} from './classes/TransportHandler';
import MixerLayer from './layers/Mixer';
import {MidiPort} from './classes/MidiPort';
import {App} from './classes/App';
import {SettingsHandler} from './classes/Settings';
import {log} from './utils/utils';
import {Controls, leds} from './Configuration';
import CursorDeviceFollowMode = com.bitwig.extension.controller.api.CursorDeviceFollowMode;
import {Control} from './controls';

let transport: TransportHandler = null;


let noteIn = null;
let inputPort = null;
let outputPort = null;
let mainTrackBank = null;
let cursorTrack = null;
let layer: MixerLayer = null;

export const preferences = {
    channel: {},
    mixer: {
        maxVolume: 100,
    }
}


export let midi: MidiPort = null

export let app: App = null;

export let settings: SettingsHandler;

// @ts-ignore
global.init = function init() {

    log('init', null);

    midi = new MidiPort({
        numInPorts: 1,
        numOutPorts: 1,
        input: 'XONE:K2',
        output: 'XONE:K2',
    });

    app = new App({
        midi,
        numTracks: 8,
        numSends: 4,
        numScenes: 8,
        numDrumPads: 34,
    });

    settings = new SettingsHandler();

    // leds.forEach((led) => led.setState('off'));
    transport = new TransportHandler();

    // cursorTrack = host.createCursorTrack(2, 4);
    // cursorTrack = host.createCursorTrack('XONE_K2_TRACK', 'Cursor Track', 2, 4, CursorDeviceFollowMode.FOLLOW_SELECTION);
    cursorTrack = host.createCursorTrack('XONE_K2_TRACK', 'Cursor Track', 2, 4, false);
    mainTrackBank = host.createMainTrackBank(12, 2, 4);
    mainTrackBank.followCursorTrack(cursorTrack);

    layer = new MixerLayer(mainTrackBank, cursorTrack);

    midi.setMidiCallback((status: number, channel: number, note: number, velocity: number) => {
        // log(`onMidi0(`, {status, channel, note, velocity});
        // layer.onMidi(status, channel, note, velocity);
        transport.onMidi(status, channel, note, velocity);
        Control.onMidi(status, channel, note, velocity);
    });

    // cursorDevice = host.createCursorTrack('XONE_K2_DEVICE', 'Cursor Device', 0, CursorDeviceFollowMode.FOLLOW_SELECTION);


    // const noteMap = initArray(-1, 128);

    // for (i = 0; i < 128; i++) {

    // }

    // noteIn = inputPort.createNoteInput('XONE:K2', '8?????', '9?????', '8?01??', '8?40??');



    // TODO: Perform further initialization here.
    println("Xone X2 Extreme initialized!");
}


// Called when a short MIDI message is received on MIDI input port 0.
function onMidi0(status: number, note: number, velocity: number) {
    // TODO: Implement your MIDI input handling code here.
    // log(`onMidi0(`, `${status}, ${note}, ${velocity})`);
    // layer.onMidi(status, note, velocity);
    if (isNoteOn(status)) {
        switch (note) {
            case Controls.shift.note:
                transport.play();
                break;
            // case Controls.volume1.note:
            // transport.play();
            // break;
            default:
            // host.errorln('shit nigga');
        }
    } else {
        // log('noteOff', null);
        // transport.stop();
    }
}

// Called when a MIDI sysex message is received on MIDI input port 0.
function onSysex0(data: string) {
    log(`onSysex: `, `${data}`);
    // MMC Transport Controls:
    switch (data) {
        case "f07f7f0605f7":
            transport.transport.rewind();
            break;
        case "f07f7f0604f7":
            transport.transport.fastForward();
            break;
        case "f07f7f0601f7":
            transport.transport.stop();
            break;
        case "f07f7f0602f7":
            transport.transport.play();
            break;
        case "f07f7f0606f7":
            transport.transport.record();
            break;
    }
}







// const indexed = Object.entries(controls).reduce((acc, [key, control]) => ({
//    ...acc,
//    [`${control.channel}-${control.note}`]: control,
// }), {});


// @ts-ignore
global.flush = function flush() {
    // log('leds', leds);
    // over(Controls, (led) => led.updateLED());
    leds.forEach((led) => led.updateLED());
}

// @ts-ignore
global.exit = function exit() {
    // log(`exit`, null);
}