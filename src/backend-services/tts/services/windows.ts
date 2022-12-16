import { invoke } from "@tauri-apps/api/tauri";
import { TTS_State } from "../schema";
import { ITTSService, TTSServiceEventBindings } from "../types";

export class TTS_WindowsService implements ITTSService {
  constructor(private bindings: TTSServiceEventBindings) {}

  dispose(): void {}

  private config = {
    voice: "",
    device: "",
  };

  start(state: TTS_State): void {
    if (!state.windows.device || !state.windows.voice) return;
    this.config = {
      device: state.windows.device,
      voice: state.windows.voice,
    };
    this.bindings.onStart();
  }
  play(value: string): void {
    invoke("plugin:windows_tts|speak", {
      data: {
        ...this.config,
        value,
      },
    });
  }
  stop(): void {
    this.bindings.onStop();
  }
}
