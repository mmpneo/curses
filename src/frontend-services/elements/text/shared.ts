import { createContext } from "react";
import { TextEvent } from "../../../types";
import { Element_TextState } from "./schema";

export type TextSentenceData = {
  id: string;
  value: string;
  interim: boolean;
  emitEvent?: string;
  emotes: TextEvent["emotes"]
  state: Element_TextState
}

export const boxCtx = createContext({});

export const sentenceCtx = createContext<{
  data: TextSentenceData,
  onActivity: (rect?: DOMRect) => void,
  onComplete: () => void
}>({
  data: {} as unknown as any,
  onActivity: () => {},
  onComplete: () => {},
});