import { BaseDirectory, createDir, exists, readBinaryFile, writeBinaryFile } from "@tauri-apps/api/fs";
import Ajv from "ajv";
import { debounce } from "lodash";
import { proxy, subscribe } from "valtio";
import { IServiceInterface } from "../../types";
import { backendSchema, BackendState } from "../schema";

class Service_State implements IServiceInterface {
  state!: BackendState;

  async init() {
    const ajv = new Ajv({ useDefaults: "empty", removeAdditional: true });
    const validate = ajv.compile(backendSchema);
    if (window.mode === "client") { //mock state
      let data = {};
      validate(data);
      this.state = proxy<BackendState>(data as BackendState);
      return;
    }

    let data = await this.#load_state();
    const hasData = !!data;
    if (!hasData) {
      data = {};
    }
    validate(data);
    this.state = proxy<BackendState>(data as BackendState);

    !hasData && this.#save_state();

    subscribe(this.state, () => this.#save_state());
  }

  private tryParseState(str: string | null) {
    if (str) try {
      const parse = JSON.parse(str);
      if (typeof parse !== "object") return;
      return parse;
    } catch (error) {
      console.error("invalid state data");
    }
  }

  async #load_state(): Promise<object | undefined> {
    if (window.platform === "app") {
      var decoder = new TextDecoder();
      const fileExists = await exists("user/settings", {dir: BaseDirectory.AppData});
      if (!fileExists)
        return;
      try {
        const data = await readBinaryFile("user/settings", {dir: BaseDirectory.AppData});
        return this.tryParseState(decoder.decode(data));
      } catch (error) {
        return;
      }
    }

    // web localstorage
    let str = localStorage.getItem("backendState");
    return this.tryParseState(str);
  }

  #save_state = debounce(async () => {
    if (window.platform === "app") {
      const encoder = new TextEncoder();
      const bExists = await exists("user", { dir: BaseDirectory.AppData });
      if (!bExists)
        await createDir("user", { dir: BaseDirectory.AppData, recursive: true });
      const value = JSON.stringify(this.state);
      console.log("save", value)
      await writeBinaryFile("user/settings", encoder.encode(value), {dir: BaseDirectory.AppData});
    }
    else {
      localStorage.setItem("backendState", JSON.stringify(this.state));
    }
  
  }, 1000);
}
export default Service_State;
