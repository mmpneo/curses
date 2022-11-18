import { Services } from "./backend-services";
import { ElementType } from "./frontend-services/schema";

export interface IServiceInterface {
  init(): void;
}

export enum TextEventType {
  final,
  interim,
}
export type TextEvent = {
  type: TextEventType;
  value: string;
};

export enum TextEventSource {
  textfield = "textfield",
  stt = "stt",
  translation = "translation",
}

export type InspectorTabPath = {
  tab: Services | ElementType | "settings" | "scenes" | "files" | "fonts",
  value?: string
}