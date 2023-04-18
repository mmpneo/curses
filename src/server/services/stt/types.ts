import { STT_State } from "./schema";

export interface ISTTReceiver {
  onStart(): void;
  onStop(error?: string): void;
  onInterim(value: string): void;
  onFinal(value: string): void;
}

export interface ISTTService {
  start(params: STT_State): void;
  stop(): void;
  dispose(): void;
}

export interface ISTTServiceConstructor {
  new (receiver: ISTTReceiver): ISTTService;
}

export interface ISpeechRecognitionService {
  start(params: STT_State): void;
  stop(): void;
  dispose(): void;
}

export const enum SttMuteState {
  muted,
  pendingUnmute,
  unmuted,
}
