import { STT_State } from "./schema";

export interface ISpeechRecognitionService {
  start(params: STT_State): void;
  stop(): void;
  dispose(): void;
}
