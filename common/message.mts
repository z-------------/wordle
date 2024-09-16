import { Outcome, Verdict } from "./types.mjs";

export enum ClientMessageKind {
    HELLO = "HELLO",
    BYE = "BYE",
    GUESS = "GUESS",
}

export interface ClientMessage {
    kind: ClientMessageKind,
    data: string,
}

export type ServerMessage = {
    kind: "INVALID_GUESS",
    reason: string,
} | {
    kind: "VERDICTS",
    isOwn: boolean,
    guessedWord: string,
    verdicts: Verdict[],
} | {
    kind: "GUESSES_LEFT",
    isOwn: boolean,
    guessesLeft: number,
    canGuess: boolean,
} | {
    kind: "ROUND",
    currentRound: number,
    totalRounds: number,
} | {
    kind: "ROUND_OUTCOME",
    scores: number[],
} | {
    kind: "OVERALL_OUTCOME",
    outcome: Outcome,
    scores: number[],
} | {
    kind: "LEAVE",
    reason: string,
}

function isClientMessage(obj: unknown): obj is ClientMessage {
    return !!obj
        && typeof obj === "object"
        && "kind" in obj
        && typeof obj.kind === "string"
        && obj.kind in ClientMessageKind
        && "data" in obj
        && typeof obj.data === "string";
}

export function parseClientMessage(obj: unknown): ClientMessage | undefined {
    console.log("parseClientMessage", obj);
    try {
        if (isClientMessage(obj)) {
            return {
                kind: obj.kind,
                data: obj.data,
            };
        } else {
            console.error("invalid message");
        }
    } catch (e) {
        console.error(`failed to parse message: ${e}`);
    }
}
