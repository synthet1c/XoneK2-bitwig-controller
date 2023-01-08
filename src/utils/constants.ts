export const NOTE_ON = 0x90;
export const NOTE_OFF = 0x80;
export const CC = 0xB0;

export const channels = initArray(1, 17).map((x, i) => i);
export const channelsString = initArray(1, 17).map((x, i) => `${i}`);