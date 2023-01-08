export function getChannel(status: number): number {
    switch (true) {
        case isNoteOn(status):
            return status - 143;
        case isNoteOff(status):
            return status - 127;
        case isChannelController(status):
            return status - 175;
    }
}

export const log = (tag: string, value: any) => {
    if (typeof value === 'undefined') {
        return (_value: any) => log(tag, value);
    }
    if (value instanceof Function) {
        println(`--> ${tag}: ${value.construtor.name} ${JSON.stringify(value, null, 2)}`);
        return;
    }
    println(`--> ${tag}: ${JSON.stringify(value, null, 2)}`);
}

export const error = (tag: string, value: any) => {
    if (typeof value === 'undefined') {
        return (_value: any) => error(tag, value);
    }
    if (value instanceof Function) {
        host.errorln(`xxxxxxxxxxx --> ${tag}: ${value.construtor.name} ${JSON.stringify(value, null, 2)}`);
        return;
    }
    host.errorln(`xxxxxxxxxxxx --> ${tag}: ${JSON.stringify(value, null, 2)}`);
}

export function alert(msg: string) {
    host.showPopupNotification(msg);
}

export function setInterval<T>(cb: () => void, delay: number) {
    host.scheduleTask(cb, delay);
}