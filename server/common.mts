import * as fs from "node:fs/promises";

export const WORD_LENGTH = 5;

function isAllLetters(s: string): boolean {
    return /^[A-Za-z]*$/.test(s);
}

export function isValidWord(word: string): boolean {
    return word.length === WORD_LENGTH && isAllLetters(word);
}

export async function readWordList(filename: string): Promise<string[]> {
    try {
        const wordList = [];
        const file = await fs.open(filename);
        for await (const line of file.readLines()) {
            const word = line.trim();
            if (isValidWord(word)) {
                wordList.push(word.toUpperCase());
            } else {
                console.warn(`Ignoring invalid word in word list: "${word}"`);
            }
        }
        if (wordList.length === 0) {
            throw new Error("Word list is empty");
        }
        return wordList;
    } catch (e) {
        throw new Error(`Failed to read words list: ${e}`);
    }
}
