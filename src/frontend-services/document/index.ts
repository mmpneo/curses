import { IServiceInterface } from "../../types";
import * as Y from "yjs";
import {
  exists,
  writeBinaryFile,
  readBinaryFile,
  createDir,
  BaseDirectory,
} from "@tauri-apps/api/fs";
import { save, open } from "@tauri-apps/api/dialog";
import { bind, Binder } from "immer-yjs";
import { toast } from "react-toastify";
import { createDocumentState, documentSchema, DocumentState } from "../schema";
import debounce from "lodash/debounce";
import Ajv from "ajv";
import { ElementType } from "../schema/element";

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

  #documentValidator: any;

  async init() {
    const ajv = new Ajv({
      strict: true,
      useDefaults: "empty",
      removeAdditional: true,
    });
    this.#documentValidator = ajv.compile(documentSchema);

    this.#file.getArray<Uint8Array>("files");
    this.fileBinder = bind<any>(this.#file.getMap("template"));
    if (window.mode === "client") {
      // wait for initial push from host
      await new Promise((res, rej) => {
        this.#file.once("update", res);
      });
    } else {
      const loadState = await this.loadDocument();
      if (loadState) {
        Y.applyUpdate(this.#file, loadState);

        window.APIFrontend.document.patch((state) => {
          // validate root state
          this.#documentValidator(state);
        });
      } else {
        // create new template
        const template = this.#file.getMap("template");
        this.#file.transact(() => {
          createDocumentState(template);

        });

        const canvas = this.fileBinder.get().canvas;
        // add default text element
        const eleWidth = canvas.w - 100;
        window.APIFrontend.elements.addElement(ElementType.text, "main", {
          w: eleWidth,
          h: 65,
          x: (canvas.w - eleWidth) / 2,
          y: (canvas.h - 65) / 2,
          r: 0
        });
        this.saveDocument();
      }
      this.#file.on("update", () => {
        this.saveDocument();
      });
    }
  }

  async importDocument() {
    const path = await open({
      filters: [
        {
          name: "Curses template",
          extensions: ["cursestemplate"],
        },
      ],
    });
    if (!path || Array.isArray(path)) return;
    const data = await readBinaryFile(path);
    const tempDoc = new Y.Doc();

    try {
      // check YJS
      Y.applyUpdate(tempDoc, data);
      // check state
      this.#documentValidator(tempDoc.getMap("template").toJSON());
      await this.#saveDocumentNative(tempDoc);

      // restart app
      window.location.reload();

      // replace file
    } catch (error) {
      toast.error("The template wasn't imported because it's invalid");
    }
  }
  async exportDocument() {
    const data = Y.encodeStateAsUpdate(this.#file);
    const path = await save({
      filters: [
        {
          name: "Curses template",
          extensions: ["cursestemplate"],
        },
      ],
    });
    if (!path) return;
    await writeBinaryFile(path, data);
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

  async #saveDocumentNative(doc: Y.Doc) {
    const bExists = await exists("user", { dir: BaseDirectory.AppData });
    if (!bExists)
      await createDir("user", { dir: BaseDirectory.AppData, recursive: true });
    const data = Y.encodeStateAsUpdate(doc);
    await writeBinaryFile("user/template", data, {dir: BaseDirectory.AppData});
  }

  saveDocument = debounce(async () => {
    if (window.platform === "web" || window.mode === "client")
      return;
    await this.#saveDocumentNative(this.#file);
  }, 2000);

  patch(patchFn: (state: DocumentState) => void) {
    this.file.transact((_) => {
      this.fileBinder.update(patchFn);
    });
  }
}
export default Service_Document;
