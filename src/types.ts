export enum TextEventType {
    final,
    interim
}
export type TextEvent = {
    type: TextEventType,
    value: string
}

export enum TextEventSource {
    textfield = "textfield",
    stt = "stt",
    translation = "translation"
}