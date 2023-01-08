/*
class DrumMachineLayer extends Layer {

    private BD_SELECT = new ToggleLayer(Controls.column[1].KNOB_1_BUTTON);
    private BD_VOLUME = Controls.sliders[1];
    private SELECTORS = [
        this.BD_SELECT,
    ];
    private padBank: DrumPadBank;

    constructor(private layerButton: Button) {
        super();
        // this.padBank = app.host.createDrumPadBank(8);
    }

    public init() {

    }

    private pads: DrumPad[] = [
        new DrumPad(Controls.matrix.A),
        new DrumPad(Controls.matrix.B),
    ]

    onCC(potentiometer: Potentiometer) {

    }

    onNoteOn(button: Button) {
        switch (button.note) {
            case this.BD_SELECT.button.note:
                return this.editDrumPattern(1, button);
        }
    }

    editDrumPattern(index: number, button: Button) {
        this.selectPattern(button);
        button.setLedState(
            button.velocity === Velocities.FULL
                ? LED_STATES.RED
                : LED_STATES.OFF
        );
    }

    selectPattern(button: Button) {
        this.SELECTORS.forEach(selector => selector.button.setLedState(LED_STATES.OFF));
        button.setLedState(LED_STATES.RED);
    }

}
*/