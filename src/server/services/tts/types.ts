import { TTS_State } from "./schema";

export interface ITTSReceiver {
  onStart(): void,
  onStop(error?: string): void,
  onFilePlayRequest(data: ArrayBuffer, options?: Record<string, any>): void;
}

export interface ITTSService {
  start(params: TTS_State): void;
  stop(): void;
  play(value: string): void;
  dispose(): void;
}


export interface ITTSServiceConstructor {
  new (receiver: ITTSReceiver): ITTSService;
}
