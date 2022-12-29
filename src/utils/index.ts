import difference from "lodash/difference";
import { subscribeKey } from "valtio/utils";
import { TextEvent, TextEventSource, TextEventType } from "../types";

export function GetArrayDiff(source: string[], target: string[]) {
  const add      = difference(target, source);
  const remove = difference(source, target);
  return {add, remove}
}

// allows to dynamically switch text source
export function serviceSubscibeToSource<Obj extends object>(baseProxy: Obj, key: keyof Obj, fn: (e?: TextEvent) => void) {
  let lastSub = "";
  subscribeKey(baseProxy, key, (e: any) => {
    window.API.pubsub.unsubscribe(lastSub);
    if (e)
      lastSub = window.API.pubsub.subscribeText(e, fn)
  });
  lastSub = window.API.pubsub.subscribeText(baseProxy[key] as any, fn)
}

export function serviceSubscibeToInput<Obj extends object>(baseProxy: Obj, enableKey: keyof Obj, fn: (e?: TextEvent) => void) {
  let lastSub = "";
  subscribeKey(baseProxy, enableKey, (e: any) => {
    window.API.pubsub.unsubscribe(lastSub);
    if (e)
      lastSub = window.API.pubsub.subscribeText(TextEventSource.textfield, fn)
  });
  if (baseProxy[enableKey])
    lastSub = window.API.pubsub.subscribeText(TextEventSource.textfield, fn)
}

export function isEmptyValue(value: any) {
  return value === undefined 
  || value === null 
  || (typeof value === 'object' && Object.keys(value).length === 0) || (typeof value === 'string' && value.trim().length === 0)
}