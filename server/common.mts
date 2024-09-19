import { WORD_LENGTH } from "../common/consts.mjs";

/**
 * Select a random item from `choices`.
 * @param choices The possible choices
 * @returns A randomly selected choice
 */
export function sample<T>(choices: T[]): T {
  return choices[Math.floor(Math.random() * choices.length)];
}

function isAllLetters(s: string): boolean {
  return /^[A-Za-z]*$/.test(s);
}

/**
 * @param word The word to check
 * @returns Whether the word is a valid word: has correct length and consists entirely of English letters
 */
export function isValidWord(word: string): boolean {
  return word.length === WORD_LENGTH && isAllLetters(word);
}
