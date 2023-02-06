import { TTS_State } from "./schema";

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
