import { invoke } from "@tauri-apps/api/tauri";
import { isEmptyValue } from "../../../../utils";
import { TTS_State } from "../schema";
import { ITTSReceiver, ITTSService } from "../types";

export class TTS_WindowsService implements ITTSService {
  constructor(private bindings: ITTSReceiver) {}

  dispose(): void {}

  get state() {
    return window.ApiServer.state.services.tts.data.windows;
  }
  start(state: TTS_State): void {
    if (Object.values(this.state).some(isEmptyValue))
      return this.bindings.onStop("Options missing");
    this.bindings.onStart();
  }
  play(value: string): void {
    invoke("plugin:windows_tts|speak", {
      data: {
        voice: this.state.voice,
        device: this.state.device,
        volume: parseFloat(this.state.volume) ?? 1,
        rate: parseFloat(this.state.rate) ?? 1,
        value,
      },
    });
  }
  stop(): void {
    this.bindings.onStop();
  }
}
