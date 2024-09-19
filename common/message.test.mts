import { describe, expect, it } from "vitest";
import { parseClientMessage } from "./message.mjs";

describe("parseClientMessage", () => {
  it("accepts valid messages", () => {
    expect(parseClientMessage({
      kind: "GUESS",
      data: "HELLO",
    })).toEqual({
      kind: "GUESS",
      data: "HELLO",
    });
  });

  it("rejects invalid messages", () => {
    expect(parseClientMessage({
      kind: "INVALID_KIND",
      data: "HELLO",
    })).toBeUndefined();
    expect(parseClientMessage("")).toBeUndefined();
    expect(parseClientMessage("not valid json")).toBeUndefined();
    expect(parseClientMessage("{}")).toBeUndefined();
  });
});
