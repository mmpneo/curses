import { IServiceInterface } from "../../types";
import * as Y from "yjs";
import {
  exists,
  writeBinaryFile,
  readBinaryFile,
  createDir,
  BaseDirectory,
} from "@tauri-apps/api/fs";
import { bind, Binder } from "immer-yjs";
import { toast } from "react-toastify";
import { createDocumentState } from "../schema";
import { debounce } from "lodash";

class Service_Document implements IServiceInterface {
  #file: Y.Doc = new Y.Doc();
  fileBinder!: Binder<any>;

  get template() {
    return this.#file?.getMap("template");
  }

  get file() {
    return this.#file;
  }

  async loadDocument(): Promise<Uint8Array | undefined> {
    const bExists = await exists("user/template", {
      dir: BaseDirectory.AppData,
    });
    if (bExists) {
      try {
        const data = await readBinaryFile("user/template", {
          dir: BaseDirectory.AppData,
        });
        return data;
      } catch (error) {
        toast("Error loading template", { type: "error" });
      }
    }
  }

  saveDocument = debounce(async () => {
    const bExists = await exists("user", { dir: BaseDirectory.AppData });
    if (!bExists)
      await createDir("user", { dir: BaseDirectory.AppData, recursive: true });
    const data = Y.encodeStateAsUpdate(this.#file);
    await writeBinaryFile("user/template", data, {
      dir: BaseDirectory.AppData,
    });
  }, 1000);

  async init() {
    this.fileBinder = bind<any>(this.#file.getMap("template"));

    const loadState = await this.loadDocument();
    if (loadState) {
      Y.applyUpdate(this.#file, loadState);
    } else {
      const template = this.#file.getMap("template");
      this.#file.transact(() => {
        createDocumentState(template);
        this.saveDocument();
      });
    }

    this.#file.on("update", () => {
      this.saveDocument();
    });
  }

  async initClient() {
    if (this.#file) this.fileBinder = bind<any>(this.#file.getMap("template"));
    await new Promise((res, rej) => {
      this.#file?.once("update", res);
    });
  }
}
export default Service_Document;
