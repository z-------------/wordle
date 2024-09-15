export enum MessageKind {
    // client -> server
    HELLO = "HELLO",
    GUESS = "GUESS",
    // server -> client
    TURN = "TURN",
    INVALID_GUESS = "INVALID_GUESS",
    VERDICTS = "VERDICTS",
    OUTCOME = "OUTCOME",
    GUESSES_LEFT = "GUESSES_LEFT",
    ROUND = "ROUND",
    ROUND_OUTCOME = "ROUND_OUTCOME",
    OVERALL_OUTCOME = "OVERALL_OUTCOME",
    PLAYER_IDX = "PLAYER_IDX",
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
