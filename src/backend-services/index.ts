import Service_STT from "./stt";
import Service_VRC from "./vrc";
import { proxy, subscribe } from "valtio";
import Ajv from "ajv";
import { backendSchema, BackendState } from "./schema";
import Service_PubSub from "./pubsub";
import Service_Shortcuts from "./shortcuts";

export enum Services {
  vrc = "vrc",
  stt = "stt",
  tts = "tts",
  twitch = "twitch",
}

class Backend {
  constructor() {
    const ajv = new Ajv({ useDefaults: "empty", removeAdditional: true });
    const validate = ajv.compile(backendSchema);

    let str = localStorage.getItem("backendState");
    let data = {};
    if (str)
      try {
        data = JSON.parse(str);
      } catch (error) {
        console.error("invalid data format");
      }
    if (typeof data !== "object") data = {};
    validate(data);
    this.state = proxy<BackendState>(data as BackendState);
    console.log(this.state);
    this.changeTheme(this.state.clientTheme);
  }

  state!: BackendState;

  public isClient = false;

  public readonly stt = new Service_STT();
  public readonly vrc = new Service_VRC();
  public readonly pubsub = new Service_PubSub();
  public readonly shortcuts = new Service_Shortcuts();

  public changeTheme(value: string) {
    this.state.clientTheme = value;
    document.body.setAttribute("data-theme", value);
  }

  private save_state() {
    localStorage.setItem("backendState", JSON.stringify(this.state));
  }

  public async Init() {
    const q = new URLSearchParams(window.location.search.substring(1));
    this.isClient = window.location.pathname.startsWith("/client");
    if (this.isClient && !q.has("c")) throw Error("invalid host netId");

    subscribe(this.state, () => this.save_state());
    this.vrc.init();
    this.shortcuts.init();
    // await this.document.LoadLocalState();
    // this.network.Init();
    if (this.isClient) {
      //   this.isClient = true;
      //   this.network.startClient(q.get("c") as string); // open connection
      //   await this.document.InitClient(); // load document
      //   this.files.Init(); // load files/blobs
      //   await this.addons.Init();
      //   this.fields.Init(); // load/initialize plugins
    } else {
      //   // this.CreateInputWindow();
      //   this.state.theme = window.API.document.getLocalData("theme") as string || "night";
      //   this.changeTheme(this.state.theme);
      //   await this.document.InitHost(); // load document
      //   this.files.Init(); // load files/blobs
      //   await this.addons.Init(); // load pubsub
      //   this.fields.Init(); // load/initialize plugins
      console.log("Init finalized");
    }

    // subscribeKey(this.state, "selectedSceneId", (v) => {
    //   const scenes    = Object.values(this.document.state.scenes);
    //   const findScene = scenes.find(s => s.id === v);
    //   findScene && this.pubsub.publish(`scene.${findScene.name}`);
    // })
  }
}

export default Backend;
