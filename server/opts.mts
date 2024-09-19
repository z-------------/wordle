import { InvalidArgumentError, ParseOptions, program } from "commander";

function parsePositiveOption(s: string): number {
  const value = parseInt(s);
  if (Number.isNaN(value) || value < 1) {
    throw new InvalidArgumentError("Not a positive integer.");
  }
  return value;
}

interface Opts {
  maxGuesses: number;
  wordsList: string;
  roundsCount: number;
}

program
  .option("--maxGuesses <n>", "maximum number of guesses", parsePositiveOption, 6)
  .option("--roundsCount <n>", "number of rounds", parsePositiveOption, 2)
  .requiredOption("--wordsList <filename>", "filename containing the newline-delimited word list");

export function parseOpts(argv?: string[], parseOptions?: ParseOptions): Opts {
  program.parse(argv, parseOptions);
  return program.opts();
}
