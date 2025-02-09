import { invoke } from "@tauri-apps/api/tauri";
import { isEmptyValue } from "../../../../utils";
import { TTS_State } from "../schema";
import { ITTSReceiver, ITTSService } from "../types";
import { toast } from "react-toastify";

export class TTS_CustomService implements ITTSService {

    constructor(private bindings: ITTSReceiver) { }

    // we use a promise as a mutex to ensure that
    // concurrent calls to `play` resolve one after the other.
    private mutex = Promise.resolve();

    dispose(): void { }

    get state() {
        return window.ApiServer.state.services.tts.data.custom;
    }

    start(state: TTS_State): void {
        if (Object.values(this.state).some(isEmptyValue))
            return this.bindings.onStop("Options missing");
        this.bindings.onStart();
    }

    async play(value: string) {
        this.mutex = this.mutex.then(async () => {
            await invoke<void>("plugin:custom_tts|speak", {
                args: {
                    device: this.state.device,
                    exe_path: this.state.exe_location,
                    value,
                },
            }).catch(err => {
                toast.error(err)
            })
        });
    }

    stop(): void {
        this.bindings.onStop();
    }
}