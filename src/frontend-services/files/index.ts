import * as Y from "yjs";
import { proxy } from "valtio";
import { IServiceInterface } from "../../types";
import { GetArrayDiff } from "../../utils";
import { createDocumentFile, FileState, FileType } from "./schema";
import { fileOpen } from "browser-fs-access";
import { nanoid } from "nanoid";

type SaveFile = Omit<FileState, "id" | "size">;

class Service_Files implements IServiceInterface {
  public readonly fileUrls = proxy<{ [id: string]: string }>({});
  public readonly ui = proxy<{ fontFamilies: string[] }>({
    fontFamilies: [],
  });

  getFileUrl(fileId: string): string | undefined {
    return this.fileUrls[fileId];
  }
  getFileData(fileId: string): FileState | undefined {
    return this.#filesMeta.find((file) => file.id === fileId);
  }
  get #yFilesBinary() {
    return window.APIFrontend.document.fileArray;
  }
  get #yFilesMeta(): any {
    return window.APIFrontend.document.template?.get("filesMeta") as Y.Array<any>;
  }
  get #filesMeta(): FileState[] {
    return this.#yFilesMeta.toJSON();
  }
  getFileBuffer(fileId: string) {
    const i = this.#filesMeta.findIndex(file => file.id === fileId);
    if (i < 0)
      return undefined;
    return this.#yFilesBinary.get(i);
  }

  async init() {
    this.#yFilesMeta.observe(() => this.#updateTrackedBlobs());
    this.#updateTrackedBlobs();
  }

  #updateTrackedBlobs() {
    const filesMeta = this.#filesMeta;

    const { add, remove } = GetArrayDiff(
      Object.keys(this.fileUrls),
      filesMeta.map((f) => f.id)
    );

    for (let id of add) {
      const metaIndex = filesMeta.findIndex((m) => m.id === id)!;
      const meta = filesMeta[metaIndex]!;
      const rawFile = window.APIFrontend.document.fileArray.get(metaIndex);
      const blob = new Blob([rawFile], { type: meta.type });
      this.fileUrls[id] = URL.createObjectURL(blob);
    }

    for (let id of remove) {
      import.meta.env.DEV;
      URL.revokeObjectURL(this.fileUrls[id]);
      delete this.fileUrls[id];
    }
  }

  async addFile(type?: FileType) {
    try {
      let mimeTypes: string[] = [
        "image/*",
        "audio/*",
        "video/*",
        "text/javascript",
      ];
      let extensions = [];
      if (type === "image") 
        mimeTypes = ["image/*"];
      else if (type === "audio")
        mimeTypes = ["audio/*"];
      else if (type === "video")
        mimeTypes = ["video/*"];
      else if (type === "font")
        mimeTypes = ["application/x-font-ttf"];

      let file: File = await fileOpen({ mimeTypes });
      const buffer = await file?.arrayBuffer();
      const arr = new Uint8Array(buffer);

      let fileType = file.type;

      if (file.name.split(".").pop() === "ttf")
        fileType = "font/ttf";

      return this.#saveFiles([{ type: fileType, name: file.name, meta: {} }], [arr]);
    } catch (error) {
      console.error(error);
    }
  }

  #saveFiles(filesMeta: SaveFile[], files: Uint8Array[]) {
    const ids: string[] = filesMeta.map((_) => nanoid());
    window.APIFrontend.document.file.transact(() => {
      const metaList = this.#yFilesMeta;

      const meta = filesMeta.map((fileMeta, i) =>
        createDocumentFile({
          ...fileMeta,
          id: ids[i],
          size: files[i].length,
        })
      );
      metaList.push(meta);
      window.APIFrontend.document.fileArray.push(files);
    });
    return ids;
  }

  removeFile(fileId: string) {
    if (!this.getFileData(fileId)) return;

    window.APIFrontend.document.patch((state) => {
      const fileIndex = state.filesMeta.findIndex((f) => f.id === fileId);
      for (let j = fileIndex + 1; j < state.filesMeta.length; j++)
        this.#yFilesMeta.get(j).set("index", j - 1);
      state.filesMeta.splice(fileIndex, 1);
      window.APIFrontend.document.fileArray.delete(fileIndex);
    });
  }
}

export default Service_Files;
