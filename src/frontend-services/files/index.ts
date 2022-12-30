import * as Y from "yjs";
import { proxy } from "valtio";
import { IServiceInterface } from "../../types";
import { GetArrayDiff } from "../../utils";
import { createDocumentFile, FileState, FileType } from "./schema";
import { fileOpen } from "browser-fs-access";
import { nanoid } from "nanoid";
import groupBy from "lodash/groupBy";
import { toast } from "react-toastify";

export interface GoogleFont {
  category: string
  family: string
  files: {
    [fontType: string]: string // file url
  }
  kind: string[]
  lastModified: string
  subsets: string[]
  variants: string[]
  version: string
}
type FontMeta = {
  family: string,
  weight: string,
  style: string
}

type SaveFile = Omit<FileState, "id" | "size">;

class Service_Files implements IServiceInterface {
  private fontsList: GoogleFont[] = [];
  public readonly fileUrls = proxy<{ [id: string]: string }>({});
  public readonly ui = proxy<{ fontFamilies: string[] }>({
    fontFamilies: [],
  });

  async init() {
    if (window.mode === "host")
      this.loadFonts();
    this.#yFilesMeta.observe(() => this.#updateTrackedBlobs());
    this.#updateTrackedBlobs();
  }

  async loadFonts() {
    try {
      const resp = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAMzuma_Br9ULWKG2O8c2OolXt9R5Z0NJc');
      const data = await resp.json() as {items: GoogleFont[]};
      this.fontsList = data.items;
    } catch (error) {}
  }

  public async installFont(fontName: string) {
    const font = this.fontsList.find(f => f.family === fontName);
    if (!font)
      return;
    const variantList = font.variants.filter(variant => !variant.includes("italic"))
    const buffersPromise = Promise.all(variantList.map(fileKey => fetch(font.files[fileKey].replace("http://", "https://"))))
      .then(resp => Promise.all(resp.map(r => r.arrayBuffer())))
      .then(buffers => {
        const variants = variantList.map(variant => ({
          family: font.family,
          weight: (variant === "regular" || variant === "italic") ? "400" : variant.replace("italic", ""),
          style: variant.includes("italic") ? "italic" : "normal",
        }));
        this.installFonts(variants, buffers.map(b => new Uint8Array(b)));
      });
    toast.promise(buffersPromise, {
      pending: "Installing font",
      success: `Installed ${fontName}`,
      error: `Error installing ${fontName}`
    });
  }

  installFonts(fonts: FontMeta[], files: Uint8Array[]) {
    const meta: SaveFile[] = fonts.map(f => ({
      type: "font/ttf",
      name: f.family,
      meta: f
    }));
    this.#saveFiles(meta, files);
  }

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

  #updateTrackedBlobs() {
    const filesMeta = this.#filesMeta;

    const { add, remove } = GetArrayDiff(
      Object.keys(this.fileUrls),
      filesMeta.map((f) => f.id)
    );

    console.log(filesMeta, this.#yFilesBinary.toJSON())

    for (let id of add) {
      const metaIndex = filesMeta.findIndex((m) => m.id === id)!;
      const meta = filesMeta[metaIndex]!;
      const rawFile = window.APIFrontend.document.fileArray.get(metaIndex);
      const blob = new Blob([rawFile], { type: meta.type });
      this.fileUrls[id] = URL.createObjectURL(blob);

      if (meta.type.startsWith("font/")) {
        if (!meta.meta)
          continue;
        const fontMeta: FontMeta = meta.meta as FontMeta;

        if (!this.ui.fontFamilies.includes(fontMeta.family))
          this.ui.fontFamilies.push(fontMeta.family);

        new FontFace(fontMeta.family, rawFile, fontMeta).load().then(font => {
          document.fonts.add(font);
        });
      }
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

  uninstallFont(family: string) {
    const ixs: number[] = [];
    this.#filesMeta.forEach((file, i) => {
      if (file.type.startsWith('font/') && file.meta?.family === family)
        ixs.push(i);
    });

    this.ui.fontFamilies = this.ui.fontFamilies.filter(f => f !== family);

    ixs.length && window.APIFrontend.document.file.transact(() => {
      this.#yFilesMeta.delete(ixs[0], ixs.length);
      this.#yFilesBinary.delete(ixs[0], ixs.length);
    });

    // find all font/* files with target family
  }
}

export default Service_Files;
