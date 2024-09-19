import { WORD_LENGTH } from "../common/consts.mjs";

export function sample<T>(choices: T[]): T {
    return choices[Math.floor(Math.random() * choices.length)];
}

function isAllLetters(s: string): boolean {
    return /^[A-Za-z]*$/.test(s);
}

export function isValidWord(word: string): boolean {
    return word.length === WORD_LENGTH && isAllLetters(word);
}
