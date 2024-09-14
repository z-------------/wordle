export const WORD_LENGTH = 5;

function isAllLetters(s: string): boolean {
    return /^[A-Za-z]*$/.test(s);
}

export function isValidWord(word: string): boolean {
    return word.length === WORD_LENGTH && isAllLetters(word);
}
