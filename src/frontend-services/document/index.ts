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
import { createDocumentState, documentSchema, DocumentState } from "../schema";
import { debounce } from "lodash";
import Ajv from "ajv";

class Service_Document implements IServiceInterface {
  #file: Y.Doc = new Y.Doc();
  fileBinder!: Binder<DocumentState>;

  get template() {
    return this.#file?.getMap("template");
  }

  get fileArray() {
    return this.#file.getArray<Uint8Array>("files");
  }

  get file() {
    return this.#file;
  }

  async init() {
    this.#file.getArray<Uint8Array>("files");
    this.fileBinder = bind<any>(this.#file.getMap("template"));
    if (window.mode === "client") {
      // wait for initial push from host
      await new Promise((res, rej) => {
        this.#file.once("update", res);
      });
    }
    else {
      const loadState = await this.loadDocument();
      if (loadState) {
        Y.applyUpdate(this.#file, loadState);

        window.APIFrontend.document.patch(state => {
          // validate root state
          const ajv = new Ajv({strict: true, useDefaults: "empty", removeAdditional: true});
          const validator = ajv.compile(documentSchema);
          validator(state);
          console.log(JSON.parse(JSON.stringify(state)));
        });

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
  }

  async loadDocument(): Promise<Uint8Array | undefined> {
    // todo support web
    if (window.platform === "web" || window.mode === "client") {
      return;
    }

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
    if (window.platform === "web" || window.mode === "client") {
      return;
    }

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
}
export default Service_Document;
