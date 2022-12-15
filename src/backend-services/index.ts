import Service_PubSub from "./pubsub";
import Service_Shortcuts from "./shortcuts";
import Service_State from "./state";
import Service_STT from "./stt";
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
  public readonly vrc = new Service_VRC();
  public readonly pubsub = new Service_PubSub();
  public readonly shortcuts = new Service_Shortcuts();

  get state() {
    return this._state.state;
  };
  
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
    await this.vrc.init();
    await this.shortcuts.init();
    window.mode === "host" && this.changeTheme(this.state.clientTheme);
    console.log("backend init");
  

  }
}

export default Backend;
