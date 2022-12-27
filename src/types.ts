import { JSONSchemaType } from "ajv";
import { Services } from "./backend-services";
import { ElementType } from "./frontend-services/schema/element";

export type MappedGroupDictionary = Record<string, ([string] | [string, string])[]>

export interface IServiceInterface {
  init(): void;
}

export enum ServiceNetworkState {
  disconnected,
  connecting,
  connected,
  error
}

export enum TextEventType {
  final,
  interim,
}

export type BaseEvent<Data = unknown> = {
  topic: string,
  data?: Data
}

export type PartialWithRequired<T, K extends keyof T> = Pick<T, K> & Partial<T>;

export type TextEvent = {
  type: TextEventType;
  value: string;
  //<wordIndex, url>
  emotes: Record<number, string>
  textFieldType: "textField" | "twitchChat"
};

export const TextEvent_Schema: JSONSchemaType<TextEvent> = {
  type:       "object",
  properties: {
    type: {type: "number", default: TextEventType.final},
    value: {type: "string", default: ""},
    textFieldType: {type: "string", default: "", nullable: true} as any, // fucking over it,
    emotes: {type: "object", additionalProperties: true, required: []},
  },
  additionalProperties: false,
  required:   ["type", "value"]
}

export enum TextEventSource {
  any = "text",
  textfield = "text.textfield",
  stt = "text.stt",
  translation = "text.translation",
}

export type InspectorTabPath = {
  tab: Services | ElementType | "settings" | "scenes" | "files" | "fonts",
  value?: string
}