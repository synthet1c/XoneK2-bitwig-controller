import DrumPadBank = com.bitwig.extension.controller.api.DrumPadBank;

export class Layer {

    public active = false;

    init() {

    }

    activate() {

    }

    deactivate() {

    }
}

export class ToggleLayer {
    isMuted = false;
    isSolo = false;
    isActive = false;
    constructor() {
    }

    update() {
        // let nextState = LED_STATES.OFF;
        // if (this.isSolo) {
        //     nextState = LED_STATES.AMBER;
        // }
        // else if (this.isMuted) {
        //     nextState = LED_STATES.RED;
        // }
        // else if (this.isActive) {
        //     nextState = LED_STATES.GREEN;
        // }
    }
}