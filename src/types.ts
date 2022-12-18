import { JSONSchemaType } from "ajv";
import { Services } from "./backend-services";
import { ElementType } from "./frontend-services/schema/element";

export interface IServiceInterface {
  init(): void;
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
};
export const TextEvent_Schema: JSONSchemaType<TextEvent> = {
  type:       "object",
  properties: {
    type: {type: "number", default: TextEventType.final},
    value: {type: "string", default: ""},
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