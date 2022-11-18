import { STT_State } from "./schema";

export enum SpeechServiceState {
  disconnected,
  connecting,
  connected,
  error
}

export type SpeechServiceEventBindings = {
  onStart: () => void,
  onStop: (value?: string) => void,
  onInterim: (value: string) => void,
  onFinal: (value: string) => void,
}

export interface ISpeechRecognitionService {
  start(params: STT_State): void;
  stop(): void;
  dispose(): void;
}
