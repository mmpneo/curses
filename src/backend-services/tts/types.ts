import { TTS_State } from "./schema";

export enum ServiceNetworkState {
  disconnected,
  connecting,
  connected,
  error
}

export type TTSServiceEventBindings = {
  onStart: () => void,
  onStop: (value?: string) => void,
}

export interface ITTSService {
  start(params: TTS_State): void;
  stop(): void;
  play(value: string): void;
  dispose(): void;
}
