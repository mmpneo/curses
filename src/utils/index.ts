import difference from "lodash/difference";
import { subscribeKey } from "valtio/utils";
import { BackendState } from "@/server/schema";
import { TextEvent, TextEventSource } from "@/types";
import { z } from "zod";
import { useSnapshot } from "valtio";

export function GetArrayDiff(source: string[], target: string[]) {
  const add = difference(target, source);
  const remove = difference(source, target);
  return { add, remove }
}

export const useBackendUpdate = <Servicekey extends keyof BackendState["services"]>(serviceKey: Servicekey) => {
  return (key: keyof BackendState["services"][Servicekey]["data"], value: any) => window.ApiServer.patchService(serviceKey, s => { (s.data as any)[key] = value })
}

export function useUpdateElement<SchemaType extends object>(id: string) {
  const { activeScene } = useSnapshot(window.ApiClient.scenes.state);
  return <K extends keyof SchemaType>(k: K, v: SchemaType[K]) => window.ApiClient.elements.updateField<SchemaType, K>(id, activeScene, k, v);
}

// allows to dynamically switch text source
export function serviceSubscibeToSource<Obj extends object>(baseProxy: Obj, key: keyof Obj, fn: (e?: TextEvent) => void) {
  let lastSub = "";
  subscribeKey(baseProxy, key, (e: any) => {
    window.ApiShared.pubsub.unsubscribe(lastSub);
    if (e)
      lastSub = window.ApiShared.pubsub.subscribeText(e, fn)
  });
  lastSub = window.ApiShared.pubsub.subscribeText(baseProxy[key] as any, fn)
}

export function serviceSubscibeToInput<Obj extends object>(baseProxy: Obj, enableKey: keyof Obj, fn: (e?: TextEvent) => void) {
  let lastSub = "";
  subscribeKey(baseProxy, enableKey, (e: any) => {
    window.ApiShared.pubsub.unsubscribe(lastSub);
    if (e)
      lastSub = window.ApiShared.pubsub.subscribeText(TextEventSource.textfield, fn)
  });
  if (baseProxy[enableKey])
    lastSub = window.ApiShared.pubsub.subscribeText(TextEventSource.textfield, fn)
}

export function isObjectVaid(value: Record<string, any>) {
  return !Object.values(value).some(isEmptyValue)
}

export function isEmptyValue(value: any) {
  return value === undefined
    || value === null
    || (typeof value === 'object' && Object.keys(value).length === 0) || (typeof value === 'string' && value.trim().length === 0)
}

export type WordReplacementsCache = {
  map: Record<string, string>,
  regexp: RegExp
  isEmpty: boolean
}

export function buildWordReplacementsCache(map: Record<string, string>, caseInsensitive: boolean): WordReplacementsCache {
  let trimKeys = Object.fromEntries(Object.entries(map).map(([k, v]) => [k.trim(), v]));
  console.log(trimKeys);
  let _map = {}
  if (caseInsensitive) {
    _map = Object.fromEntries(Object.entries(map).map(([k, v]) => [k.toLowerCase(), v]));
  }
  else
    _map = { ...map };
  let regexp = new RegExp(`\\b(${Object.keys(_map).join("|")})\\b`, caseInsensitive ? "ig" : "g");
  return {
    regexp,
    map: _map,
    isEmpty: !Object.keys(_map).length
  };
}

//decode by niklasvh
// https://github.com/niklasvh/base64-arraybuffer/blob/master/src/index.ts
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}

export const decodeB64toArrayBuffer = (base64: string): ArrayBuffer => {
  let bufferLength = base64.length * 0.75,
    len = base64.length,
    i,
    p = 0,
    encoded1,
    encoded2,
    encoded3,
    encoded4;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64.charCodeAt(i)];
    encoded2 = lookup[base64.charCodeAt(i + 1)];
    encoded3 = lookup[base64.charCodeAt(i + 2)];
    encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return arraybuffer;
};

export const zStringNumber = () => z.coerce.number().pipe(z.coerce.string());
export const zSafe = <zObj extends z.ZodTypeAny, Val extends z.infer<zObj>>(
  obj: zObj,
  value: z.util.noUndefined<Val> | (() => z.util.noUndefined<Val>)
) => obj.default(value).catch(value);
// need this for zod transition
export const assertTypes = <A, B extends A>() => { };

/**
 * Converts an ArrayBufferLike to an ArrayBuffer by copying its contents.
 * 
 * @param buffer - The input buffer to convert
 * @returns A new ArrayBuffer containing the same data
 */
export function toArrayBuffer(buffer: ArrayBufferLike): ArrayBuffer {
  // Create a new ArrayBuffer with the same length
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);

  // Create views to copy the data
  const sourceView = new Uint8Array(buffer);
  const destView = new Uint8Array(arrayBuffer);

  // Copy all bytes from the ArrayBufferLike to the new ArrayBuffer
  destView.set(sourceView);

  return arrayBuffer;
}