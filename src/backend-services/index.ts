import produce from "immer";
import Service_PubSub from "./pubsub";
import { BackendState } from "./schema";
import Service_Shortcuts from "./shortcuts";
import Service_State from "./state";
import Service_STT from "./stt";
import Service_TTS from "./tts";
import Service_VRC from "./vrc";

export enum Services {
  vrc = "vrc",
  stt = "stt",
  tts = "tts",
  twitch = "twitch",
}

class Backend {
  constructor() {}
  
  
  private readonly _state = new Service_State();
  public readonly stt = new Service_STT();
  public readonly tts = new Service_TTS();
  public readonly vrc = new Service_VRC();
  public readonly pubsub = new Service_PubSub();
  public readonly shortcuts = new Service_Shortcuts();

  get state() {
    return this._state.state;
  };

  patchService<Key extends keyof BackendState["services"]>(service: Key, fn: (state: BackendState["services"][Key]) => void) {
    fn(this.state.services[service]);
    // this.state.services[service] = produce(this.state.services[service], fn);
  }
  
  public changeTheme(value: string) {
    this.state.clientTheme = value;
    document.body.setAttribute("data-theme", value);
  }

  public changeScale(value: number) {
    this.state.uiScale = value;
    document.documentElement.style.setProperty("--uiscale", value.toString());
  }
  
  public async init() {
    await this._state.init();
    await this.pubsub.init();
    await this.stt.init();
    await this.tts.init();
    await this.vrc.init();
    await this.shortcuts.init();
    window.mode === "host" && this.changeTheme(this.state.clientTheme);
    console.log("backend init");
  

  }
}

export default Backend;
