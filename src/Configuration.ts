import {Encoder, Knob, LedButton, Slider, WeirdButton} from './controls';
import {channelify, flatMapLeds} from './utils/helpers';
import {Observers} from './classes/PubSub';

const observers: Observers = {
    // 'transport.play': app.transport.isPlaying(),
}

export enum LED_STATES {
    OFF = 'OFF',
    RED = 'RED',
    AMBER = 'AMBER',
    GREEN = 'GREEN',
    RED_BLINKING = 'RED_BLINKING',
    AMBER_BLINKING = 'AMBER_BLINKING',
    GREEN_BLINKING = 'GREEN_BLINKING',
}

export enum LAYER {
    MIXER = 'MIXER',
    MIXERTEST = 'MIXERTEST',
    DRUMS = 'DRUMS',
}

export enum Velocities {
    ZERO = 0,
    HALF = 64,
    FULL = 128,
}

export const GlobalControls = {
    encoders: {
        1: new Encoder(0),
        2: new Encoder(1),
        3: new Encoder(2),
        4: new Encoder(3),
    },
    encoderLeds: {
        1: new LedButton(52),
        2: new LedButton(53),
        3: new LedButton(54),
        4: new LedButton(55),
    },
    column: {
        1: {
            KNOB_1: new Knob(4),
            KNOB_1_BUTTON: new LedButton(48),
            KNOB_2: new Knob(8),
            KNOB_2_BUTTON: new LedButton(44),
            KNOB_3: new Knob(12),
            KNOB_3_BUTTON: new LedButton(40),
        },
        2: {
            KNOB_1: new Knob(5),
            KNOB_1_BUTTON: new LedButton(49),
            KNOB_2: new Knob(9),
            KNOB_2_BUTTON: new LedButton(45),
            KNOB_3: new Knob(13),
            KNOB_3_BUTTON: new LedButton(41),
        },
        3: {
            KNOB_1: new Knob(6),
            KNOB_1_BUTTON: new LedButton(50),
            KNOB_2: new Knob(10),
            KNOB_2_BUTTON: new LedButton(46),
            KNOB_3: new Knob(14),
            KNOB_3_BUTTON: new LedButton(42),
        },
        4: {
            KNOB_1: new Knob(7),
            KNOB_1_BUTTON: new LedButton(51),
            KNOB_2: new Knob(11),
            KNOB_2_BUTTON: new LedButton(47),
            KNOB_3: new Knob(15),
            KNOB_3_BUTTON: new LedButton(43),
        }
    },
    sliders: {
        A: new Slider(16),
        B: new Slider(17),
        C: new Slider(18),
        D: new Slider(19),
    },
    matrix: {
        A: new LedButton(36),
        B: new LedButton(37),
        C: new LedButton(38),
        D: new LedButton(39),

        E: new LedButton(32),
        F: new LedButton(33),
        G: new LedButton(34),
        H: new LedButton(35),

        I: new LedButton(28),
        J: new LedButton(29),
        K: new LedButton(30),
        L: new LedButton(31),

        M: new LedButton(24),
        N: new LedButton(25),
        O: new LedButton(26),
        P: new LedButton(27),
    },
    layer: new WeirdButton(12),
    shift: new WeirdButton(15),
    encoder: new Encoder(20),
    scroll: new Encoder(21),
}

export const ChannelControls = {
    A: channelify(GlobalControls, 1),
    B: channelify(GlobalControls, 2),
    C: channelify(GlobalControls, 3),
    D: channelify(GlobalControls, 4),
}

export const leds = flatMapLeds(ChannelControls, []);
