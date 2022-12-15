import { Services } from "./backend-services";
import { ElementType } from "./frontend-services/schema/element";

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
  any = "text",
  textfield = "text.textfield",
  stt = "text.stt",
  translation = "text.translation",
}

export type InspectorTabPath = {
  tab: Services | ElementType | "settings" | "scenes" | "files" | "fonts",
  value?: string
}