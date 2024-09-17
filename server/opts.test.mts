import { describe, expect, it } from "vitest";
import { parseOpts } from "./opts.mjs";

describe("parseOpts function", () => {
  it("parses options", () => {
    const opts = parseOpts(["--maxGuesses", "5", "--wordsList", "words.txt"], { from: "user" });
    expect(opts.maxGuesses).toEqual(5);
    expect(opts.wordsList).toEqual("words.txt");
  });

  it("provides defaults", () => {
    const opts = parseOpts(["--wordsList", "words.txt"], { from: "user" });
    expect(opts.maxGuesses).toBeGreaterThan(0);
    expect(opts.wordsList).toEqual("words.txt");
  });
});
