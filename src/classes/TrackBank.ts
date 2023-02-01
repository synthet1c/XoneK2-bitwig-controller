import {ReplaySubject} from 'rxjs';
import {App} from './App';
import {log} from '../utils';
import {toObservable, observerToObservable} from '../utils/toObservable';

type SettableValue = com.bitwig.extension.controller.api.SettableBeatTimeValue
    | com.bitwig.extension.controller.api.SettableBooleanValue
    | com.bitwig.extension.controller.api.SettableColorValue
    | com.bitwig.extension.controller.api.SettableDoubleValue
    | com.bitwig.extension.controller.api.SettableEnumValue
    | com.bitwig.extension.controller.api.SettableIntegerValue
    | com.bitwig.extension.controller.api.SettableRangedValue
    | com.bitwig.extension.controller.api.SettableStringArrayValue
    | com.bitwig.extension.controller.api.SettableStringValue
    | com.bitwig.extension.controller.api.SoloValue
    | com.bitwig.extension.controller.api.StringValue
    ;

interface TrackObservers {
    mute$: ReplaySubject<boolean>;
    solo$: ReplaySubject<boolean>;
    selected$: ReplaySubject<boolean>;
    // volume$: ReplaySubject<number>;
    // send1$: ReplaySubject<number>;
    // send2$: ReplaySubject<number>;
    trackType$: ReplaySubject<string>;
}

export default class TrackBankHandler {

    public trackBank: API.TrackBank;

    public banks: TrackObservers[];

    public cursorName$: ReplaySubject<string>;

    constructor(private app: App) {
        this.trackBank = app.trackBank;

        this.cursorName$ = toObservable(this.app.cursorTrack.name());

        this.banks = initArray(0, this.trackBank.getSizeOfBank()).map((x, i): TrackObservers => {
            const item = this.trackBank.getItemAt(i);
            return {
                mute$: toObservable<boolean>(item.mute()),
                solo$: toObservable<boolean>(item.solo()),
                // select$: this.toObservable<boolean>(item.position()),
                // volume$: this.toObservable<number>(item.volume()),
                // send1$: this.toObservable<number>(item.getSend(0)),
                // send2$: this.toObservable<number>(item.getSend(1)),
                trackType$: toObservable<string>(item.trackType()),
                selected$: observerToObservable(item.addIsSelectedInMixerObserver),
            }
        })
    }

}