export enum MessageKind {
    TURN = "TURN",
    GUESS = "GUESS",
    INVALID_GUESS = "INVALID_GUESS",
    VERDICTS = "VERDICTS",
    OUTCOME = "OUTCOME",
}

export interface Message {
    kind: MessageKind;
    data: string;
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

export function parseMessage(data: string): Message | undefined {
    console.log("parseMessage", data);
    try {
        const obj: unknown = JSON.parse(data);
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
