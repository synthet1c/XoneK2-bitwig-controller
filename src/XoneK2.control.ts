import {TransportHandler} from './classes/TransportHandler';
import MixerLayer from './layers/Mixer';
import {MidiPort} from './classes/MidiPort';
import {App} from './classes/App';
import {SettingsHandler} from './classes/Settings';
import {log} from './utils';
import {leds} from './Configuration';

let transport: TransportHandler = null;
let mainTrackBank = null;
let cursorTrack = null;
let layer: MixerLayer = null;
export let midi: MidiPort = null
export let app: App = null;
export let settings: SettingsHandler;

export const preferences = {
    channel: {},
    mixer: {
        maxVolume: 100,
    }
}


// @ts-ignore
global.init = function init() {
    let start = Date.now();
    log("<--------- Xone X2 Extreme init! --------->", new Date().toString());

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
    transport = new TransportHandler();
    cursorTrack = host.createCursorTrack('XONE_K2_TRACK', 'Cursor Track', 2, 4, false);
    mainTrackBank = host.createMainTrackBank(12, 2, 4);
    mainTrackBank.followCursorTrack(cursorTrack);
    layer = new MixerLayer(mainTrackBank, cursorTrack);

    log("<--------- Xone X2 Extreme end init! --------->", Date.now() - start + 'ms');
}

// @ts-ignore
global.flush = function flush() {
    leds.forEach((led) => led.updateLED());
}

// @ts-ignore
global.exit = function exit() {
    log("<--------- Xone X2 Extreme exit! --------->", new Date().toString());
}