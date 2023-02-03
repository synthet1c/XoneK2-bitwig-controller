import {TransportHandler} from './classes/TransportHandler';
import MixerLayer from './layers/Mixer';
import {MidiPort} from './classes/MidiPort';
import {App} from './classes/App';
import {SettingsHandler} from './classes/Settings';
import {error, log} from './utils';
import {leds} from './Configuration';
import DrumMachineLayer from './layers/DrumMachine';
import {LayerHandler} from './classes/Layer';
import TrackBank from './classes/TrackBank';
import TrackBankHandler from './classes/TrackBank';

let transport: TransportHandler = null;
let mainTrackBank = null;
let cursorTrack = null;
export let layer: LayerHandler = null;
export let midi: MidiPort = null
export let app: App = null;
export let settings: SettingsHandler;
export let trackBankHandler: TrackBankHandler;

export const preferences = {
    channel: {},
    mixer: {
        maxVolume: 100,
        maxDrumVolume: 100,
    }
}


// @ts-ignore
global.init = function init() {
    let start = Date.now();
    error("<--------- Xone X2 Extreme init! --------->", new Date().toString());

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
    trackBankHandler = new TrackBankHandler(app);

    layer = new LayerHandler(app, {
        mixer: new MixerLayer(app),
        drum: new DrumMachineLayer(app),
    });

    error("<--------- Xone X2 Extreme end init! --------->", Date.now() - start + 'ms');
}

// @ts-ignore
global.flush = function flush() {
    leds.forEach((led) => led.updateLED());
}

// @ts-ignore
global.exit = function exit() {
    log("<--------- Xone X2 Extreme exit! --------->", new Date().toString());
}