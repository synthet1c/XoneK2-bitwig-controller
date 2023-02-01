export function alert(msg: string) {
    host.showPopupNotification(msg);
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

export const trace = (tag: string) => (value: any) => {
    log(tag, value);
    return value;
}


