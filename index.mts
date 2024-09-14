import * as readline from "node:readline/promises";
import { open } from "node:fs/promises";
import colors from "yoctocolors";
import { stdin, stdout } from "node:process";

enum Verdict {
    HIT,
    PRESENT,
    MISS,
}

const WORD_LENGTH = 5;

function isAllLetters(s: string): boolean {
    return /^[A-Za-z]*$/.test(s);
}

function isValidWord(word: string): boolean {
    return word.length === WORD_LENGTH && isAllLetters(word);
}

async function readWordList(filename: string): Promise<string[]> {
    const wordList = [];
    const file = await open(filename);
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
}

function sample<T>(choices: T[]): T {
    return choices[Math.floor(Math.random() * choices.length)];
}

async function readGuessedWord(rl: readline.Interface, guessesLeft: number): Promise<string> {
    while (true) {
        const guessedWord = (await rl.question(`Enter your guess (${guessesLeft} tries left): `)).toUpperCase();
        if (isValidWord(guessedWord)) {
            return guessedWord;
        }
        console.log(colors.red("Invalid guess."));
    }
}

function judge(word: string, guessedWord: string): Verdict[] {
    const verdicts: Verdict[] = Array(WORD_LENGTH).fill(Verdict.MISS);
    const usedIndexes: number[] = [];
    // check for HIT letters
    for (let i = 0; i < guessedWord.length; ++i) {
        if (guessedWord[i] === word[i]) {
            verdicts[i] = Verdict.HIT;
            usedIndexes.push(i);
        }
    }
    // check for PRESENT letters that aren't already used
    for (let i = 0; i < guessedWord.length; ++i) {
        for (let j = 0; j < word.length; ++j) {
            if (guessedWord[i] === word[j] && verdicts[i] !== Verdict.HIT && !usedIndexes.includes(j)) {
                verdicts[i] = Verdict.PRESENT;
                usedIndexes.push(j);
                break;
            }
        }
    }
    return verdicts;
}

function formatVerdicts(verdicts: Verdict[], guessedWord: string): string {
    let displayed = "";
    for (let i = 0; i < WORD_LENGTH; ++i) {
        const verdict = verdicts[i];
        const format = verdict === Verdict.HIT ? colors.bgGreen : verdict === Verdict.PRESENT ? colors.bgYellow : colors.reset;
        displayed += format(guessedWord[i]);
    }
    return displayed;
}

const maxGuesses = 5;
const word = sample(await readWordList("words.txt"));

console.log(colors.bold("Welcome to Wordle."));
console.log("");
console.log(colors.bold("Rules:"));
console.log(`Guess the ${WORD_LENGTH}-letter word within ${maxGuesses} tries.`);
console.log(`${colors.bgGreen("Green")} means the letter is correct. ${colors.bgYellow("Yellow")} means the letter is present but in the wrong position.`);
console.log("Otherwise, the letter is incorrect.")

const rl = readline.createInterface({
    input: stdin,
    output: stdout,
});

let win = false;
for (let i = 0; !win && i < maxGuesses; ++i) {
    const guessedWord = await readGuessedWord(rl, maxGuesses - i);
    const verdicts = judge(word, guessedWord);
    console.log(formatVerdicts(verdicts, guessedWord));
    win = verdicts.every(v => v === Verdict.HIT);
}
rl.close();
if (win) {
    console.log("You win.");
} else {
    console.log(`You lose. The word was '${word}'.`);
}
