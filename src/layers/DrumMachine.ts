import {App} from '../classes/App';
import {app, layer, preferences} from '../XoneK2.control';
import {applySpec, path} from 'rambda';
import {ChannelControls} from '../Configuration';
import {error, log, trace} from '../utils';
import {MidiEvent, AMBER, Control, GREEN, OFF, RED} from '../controls';
import {Layer} from '../classes/Layer';
import {toObservable, observerToObservable} from '../utils/toObservable';
import {BehaviorSubject, map, ReplaySubject, Subscription} from 'rxjs';
import NoteStep = com.bitwig.extension.controller.api.NoteStep;
import PlayingNote = com.bitwig.extension.controller.api.PlayingNote;

export interface DrumRackControls {
    encoder: Control,
    mute: Control;
    a: Control;
    select: Control;
    solo: Control;
    volume: Control;
    send1: Control;
    send2: Control;
}

export default class DrumMachineLayer extends Layer {

    app: App;
    active = false;
    destroy$: BehaviorSubject<boolean>;
    subscriptions: Subscription[] = [];
    stepData$: ReplaySubject<any>;

    private selectors = [
        ChannelControls.A.column[1].KNOB_3_BUTTON,
        ChannelControls.A.column[2].KNOB_3_BUTTON,
        ChannelControls.A.column[3].KNOB_3_BUTTON,
        ChannelControls.A.column[4].KNOB_3_BUTTON,
        ChannelControls.B.column[1].KNOB_3_BUTTON,
        ChannelControls.B.column[2].KNOB_3_BUTTON,
        ChannelControls.B.column[3].KNOB_3_BUTTON,
        ChannelControls.B.column[4].KNOB_3_BUTTON,
    ];

    private pads = [
        'A', 'B', 'C', 'D',
        'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L',
        'M', 'N', 'O', 'P',
    ].map(char => ChannelControls.A.matrix[char])

    private matrix = [
        ['A', 'B', 'C', 'D'],
        ['E', 'F', 'G', 'H'],
        ['I', 'J', 'K', 'L'],
        ['M', 'N', 'O', 'P'],
    ]

    private getMixerControls = (deck: string, offset: number) => applySpec<DrumRackControls>({
        encoder: path([deck, 'encoders', offset + 1]),
        mute: path([deck, 'matrix', this.matrix[0][offset]]),
        a: path([deck, 'matrix', this.matrix[1][offset]]),
        select: path([deck, 'column', offset + 1, 'KNOB_1_BUTTON']),
        solo: path([deck, 'matrix', this.matrix[3][offset]]),
        volume: path([deck, 'sliders', this.matrix[0][offset]]),
        send1: path([deck, 'column', offset + 1, 'KNOB_1']),
        send2: path([deck, 'column', offset + 1, 'KNOB_2']),
    })(ChannelControls)

    private observables: any[];

    constructor(app: App) {
        super(app);
        this.app = app;
        this.init();
    }

    init = () => {
        this.stepData$ = observerToObservable(this.app.drumEditorCursor.addStepDataObserver);
        this.observables = initArray(0, 8).map((x, i) => {
            const pad = this.app.cursorDrumPadBank.getItemAt(i);
            return {
                mute$: toObservable(pad.mute()),
                solo$: toObservable(pad.solo()),
                selectedInEditor$: observerToObservable(pad.addIsSelectedInEditorObserver),
                exists$: toObservable(pad.exists()),
                // @ts-ignore
                playingNotes$: toObservable(pad.playingNotes()).pipe(map(this.convertPlayingNotes)),
                stepData$: observerToObservable(this.app.drumEditorCursor.addStepDataObserver),
                noteData$: observerToObservable(this.app.drumEditorCursor.addNoteStepObserver),
            }
        });
        this.app.cursorClip.addStepDataObserver((step: number, y: number, playing: number) => {
            error('step', {step, y, playing});
        });
    }

    activate = () => {

        error('DrumMachine', 'activate');

        this.active = true;
        this.destroy$ = new BehaviorSubject<boolean>(true);
        this.subscriptions = [];

        this.subscriptions.push(
            this.stepData$.subscribe(trace('stepData$')),
        );

        for (let i = 0; i < 8; i++) {
            const observables = this.observables[i];
            const pad = this.app.cursorDrumPadBank.getItemAt(i);
            const selector = this.selectors[i];
            const controls = this.controls[i];

            this.subscriptions.push(
                observables.mute$.subscribe((muted: boolean) => controls.mute.setState(muted ? RED : GREEN)),
                observables.solo$.subscribe((solo: boolean) => controls.solo.setState(solo ? AMBER : OFF)),
                observables.selectedInEditor$.subscribe((selected: boolean) => selector.setState(selected ? AMBER : RED)),
                observables.exists$.subscribe(trace('exists$')),
                observables.playingNotes$.subscribe(trace('playingNotes$')),
                selector.onNoteOn$.subscribe((e: MidiEvent) => pad.selectInEditor()),
                controls.mute.onNoteOn$.subscribe((e: MidiEvent) => pad.mute().toggle()),
                controls.solo.onNoteOn$.subscribe((e: MidiEvent) => pad.solo().toggle(false)),
                controls.volume.onCC$.subscribe((e: MidiEvent) => pad.volume().set(Math.min(preferences.mixer.maxDrumVolume, e.velocity), 128)),
                controls.encoder.onCC$.subscribe((e: MidiEvent) => {
                    this.app.cursorRemote.getParameter(i).inc(e.velocity > 64 ? -0.01 : 0.01);
                }),
                observables.noteData$.subscribe((value: NoteStep) => log('step$', {value})),
                observables.stepData$.subscribe(((step: number, y: number, playing: number) => {
                    log('step', {step, y, playing});
                })),
            )
        }

        // this.testPlayingNotes();
    }

    deactivate = () => {
        error('DrumMachine', 'deactivate');
        this.destroy$.next(false);
        this.destroy$.complete();
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
        this.selectors.forEach((selector) => selector.setState(OFF));
        super.deactivate();
    }

    convertPlayingNotes = (notes: PlayingNote[]) => {
        log('notes', notes);
        return notes.map(note => ({
            pitch: note.pitch(),
            velocity: note.velocity(),
        }))
    }

    private controls: DrumRackControls[] = [
        this.getMixerControls('A', 0),
        this.getMixerControls('A', 1),
        this.getMixerControls('A', 2),
        this.getMixerControls('A', 3),
        this.getMixerControls('B', 0),
        this.getMixerControls('B', 1),
        this.getMixerControls('B', 2),
        this.getMixerControls('B', 3),
    ]


    // This updates, but it doesn't show the playing notes that can be drown onto the controller
    testPlayingNotes = () => {
        this.app.cursorTrack.playingNotes().addValueObserver((notes) => {
            // this.app.drumPads.updateNotes(n);
            // log('cursorTrack.playingNotes', { pitch: note.pitch(), velocity: note.velocity() });
            if (notes.length) {
                const noteNumbers = Array.from(notes).map(note => note ? note.pitch() - 36 : 0);
                log('cursorTrack.playingNotes', noteNumbers);
                for (let i = 0; i < this.selectors.length; i++) {
                    this.selectors[i].control.setState(OFF);
                }
                let red = true;
                for (let i = 0; i < 8; i++) {
                    const note = notes[i];
                    const selector = this.selectors[i];
                    if (~noteNumbers.indexOf(i)) {
                        const nextState = RED;
                        selector.control.setState(RED);
                        selector.state = nextState;
                    } else {
                        const nextState = OFF;
                        selector.control.setState(OFF);
                        selector.state = nextState;
                    }
                }
            }
        });
    }


}