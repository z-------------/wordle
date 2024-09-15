export enum MessageKind {
    HELLO = "HELLO",
    TURN = "TURN",
    GUESS = "GUESS",
    INVALID_GUESS = "INVALID_GUESS",
    VERDICTS = "VERDICTS",
    OPPONENT_VERDICTS = "OPPONENT_VERDICTS",
    OUTCOME = "OUTCOME",
    GUESSES_LEFT = "GUESSES_LEFT",
    OPPONENT_GUESSES_LEFT = "OPPONENT_GUESSES_LEFT",
}

export interface Message {
    kind: MessageKind;
    data: string;
}

export function createMessage(kind: MessageKind, data: string): Message {
    return { kind, data };
}

function isMessage(obj: unknown): obj is Message {
    return !!obj
        && typeof obj === "object"
        && "kind" in obj
        && typeof obj.kind === "string"
        && obj.kind in MessageKind
        && "data" in obj
        && typeof obj.data === "string";
}

export function parseMessage(obj: unknown): Message | undefined {
    console.log("parseMessage", obj);
    try {
        if (isMessage(obj)) {
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
