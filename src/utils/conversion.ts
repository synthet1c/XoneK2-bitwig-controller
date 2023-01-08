export const notes = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B'
];

export const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export function noteToDecimal(musicalNote: string): number {
    const match = musicalNote.match(/(\w#?)(\d)/i);
    if (!match) {
        throw new Error(`cannot convert note: ${musicalNote}`)
    }
    const [_, note, octave] = match;
    const x = (1 + notes.indexOf(note)) * (1 + parseInt(octave)) - 1;
    return x;
}

export function decimalToNote(int: number): string {
    const note = notes[int % 12];
    const octave = Math.floor(int / 12);
    return note + octave;
}

export function decimalToHex(decimal: number) {
    return decimal.toString(16);
}

export function hexToDecimal(hex: string) {
    return parseInt(hex, 16);
}

export function noteToHex(note: string) {
    return decimalToHex(noteToDecimal(note))
}

export function toAlpha(index: number): string {
    return alphabet[index];
}
