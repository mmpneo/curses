import { invoke } from "@tauri-apps/api/tauri";
import { isEmptyValue } from "../../../../utils";
import { TTS_State } from "../schema";
import { ITTSReceiver, ITTSService } from "../types";

export class TTS_UberduckService implements ITTSService {
  constructor(private bindings: ITTSReceiver) {}

  dispose(): void {}

  get state() {
    return window.ApiServer.state.services.tts.data.uberduck;
  }

  start(state: TTS_State): void {
    if (Object.values(this.state).some(isEmptyValue))
      return this.bindings.onStop("Options missing");
    this.bindings.onStart();
  }
  async play(value: string) {
    invoke("plugin:uberduck_tts|speak", {
      data: {
        auth: {
          api_key: this.state.api_key,
          secret_key: this.state.secret_key,
        },
        text: value,
        device_name: "Headphones (Realtek(R) Audio)",
        volume: parseFloat(this.state.volume) || 1,
        voicemodel_uuid: this.state.voice,
      },
    });
  }
  stop(): void {
    this.bindings.onStop();
  }
}
