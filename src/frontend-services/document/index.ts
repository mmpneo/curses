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
import { createDocumentState, DocumentState } from "../schema";
import { debounce } from "lodash";

class Service_Document implements IServiceInterface {
  #file: Y.Doc = new Y.Doc();
  fileBinder!: Binder<DocumentState>;

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

  patch(patchFn: (state: DocumentState) => void) {
    this.file.transact((_) => {
      this.fileBinder.update(patchFn);
    });
  }

  async init() {
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
    this.fileBinder = bind<any>(this.#file.getMap("template"));
    console.log("Loaded template", this.#file.getMap("template").toJSON());

    this.#file.on("update", () => {
      this.saveDocument();
    });
  }

  async initClient() {
    if (this.#file) this.fileBinder = bind<DocumentState>(this.#file.getMap("template"));
    await new Promise((res, rej) => {
      this.#file?.once("update", res);
    });
  }
}
export default Service_Document;
