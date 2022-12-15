import { difference } from "lodash";

export function GetArrayDiff(source: string[], target: string[]) {
  const add      = difference(target, source);
  const remove = difference(source, target);
  return {add, remove}
}