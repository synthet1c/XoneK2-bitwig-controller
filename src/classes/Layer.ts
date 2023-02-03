import DrumPadBank = com.bitwig.extension.controller.api.DrumPadBank;
import MixerLayer from '../layers/Mixer';
import {ChannelControls, GlobalControls} from '../Configuration';
import {GREEN, LedButton, RED} from '../controls';
import {alert, error, log} from '../utils';
import {App} from './App';


export class Layer {

    scrollOffset = 0;
    active = false;

    constructor(public app: App) {
        this.app.trackBank.cursorIndex().markInterested();
        this.app.trackBank.scrollPosition().addValueObserver((position) => {
            this.scrollOffset = position;
        }, 0);
    }

    init() {

    }

    activate() {

    }

    deactivate() {

    }
}

export class LayerHandler {

    public active = false;
    private activeLayer: Layer;
    private activeLayerIndex = 0;
    private layersIndexed: string[];

    private layers: {[name: string]: Layer}

    private layerButton = ChannelControls.A.layer;

    private buttons = [
        ChannelControls.A.column[1].KNOB_1_BUTTON,
        ChannelControls.A.column[2].KNOB_1_BUTTON,
        ChannelControls.A.column[3].KNOB_1_BUTTON,
        ChannelControls.A.column[4].KNOB_1_BUTTON,
        ChannelControls.B.column[1].KNOB_1_BUTTON,
        ChannelControls.B.column[2].KNOB_1_BUTTON,
        ChannelControls.B.column[3].KNOB_1_BUTTON,
        ChannelControls.B.column[4].KNOB_1_BUTTON,
    ];

    constructor(private app: App, layers: {[name: string]: Layer }) {
        this.layers = layers;
        this.activeLayer = layers.mixer;
        this.activeLayerIndex = 0;
        this.layersIndexed = Object.keys(layers);
        this.init();
    }

    init() {
        this.addListeners();
        this.activeLayer.activate();
    }

    addListeners = () => {

        for (let i = 0; i < this.app.trackBank.getSizeOfBank(); i++) {
            const item = this.app.trackBank.getItemAt(i);
            const button = this.buttons[i];
            button.onNoteOn$.subscribe((e: Event) => {
                item.selectInMixer();
            });
        }

        this.layerButton.onNoteOn$.subscribe(this.setLayer);
    }

    setLayer = (e: Event) => {
        const nextIndex = (this.activeLayerIndex + 1) >= this.layersIndexed.length ? 0 : this.activeLayerIndex + 1;
        this.activeLayerIndex = nextIndex;
        const nextLayer = this.layersIndexed[nextIndex];
        this.activate(nextLayer);
    }

    public activate = (layerName: string) => {
        this.activeLayer.deactivate();
        this.activeLayer = this.layers[layerName];
        error('activate', layerName);
        alert(layerName);
        this.activeLayer.activate();

        switch (this.activeLayer) {
            case this.layers.mixer:
                this.layerButton.setState(GREEN);
                break;
            case this.layers.drum:
                this.layerButton.setState(RED);
                break;
        }
    }

    deactivate() {

    }
}