import { isEmptyValue } from "../../../../utils";
import { TTS_State } from "../schema";
import { ITTSReceiver, ITTSService } from "../types";

export class TTS_VoicevoxService implements ITTSService {
  constructor(private bindings: ITTSReceiver) {}

  dispose(): void {}

  get state() {
    return window.ApiServer.state.services.tts.data.tiktok;
  }

  start(state: TTS_State): void {
    if (Object.values(this.state).some(isEmptyValue))
      return this.bindings.onStop("Options missing");
    this.bindings.onStart();
  }
  async play(value: string) {

  }
  stop(): void {
    this.bindings.onStop();
  }
}
