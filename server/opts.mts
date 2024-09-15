import { InvalidArgumentError, OptionValues, program } from "commander";

function parsePositiveOption(s: string): number {
    const value = parseInt(s);
    if (Number.isNaN(value) || value < 1) {
        throw new InvalidArgumentError("Not a positive integer.");
    }
    return value;
}

export function parseOpts(): OptionValues {
    program
        .option("--maxGuesses <n>", "maximum number of guesses", parsePositiveOption, 5)
        .requiredOption("--wordsList <filename>", "filename containing the newline-delimited word list");
    program.parse();
    return program.opts();
}
