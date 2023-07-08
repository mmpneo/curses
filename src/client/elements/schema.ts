import { zSafe } from "@/utils";
import z from "zod";
import { Element_ImageStateSchemaN } from "./image/schema";
import { Element_TextStateSchemaN } from "./text/schema";

export enum ElementType {
  text  = "text",
  image = "image",
}
const ElementTypeSchema = z.nativeEnum(ElementType);

const ElementSchemaMap = {
  [ElementType.image]: Element_ImageStateSchemaN,
  [ElementType.text]: Element_TextStateSchemaN,
}

export const TransformRectSchema = z.object({
  x: zSafe(z.number(), 0),
  y: zSafe(z.number(), 0),
  w: zSafe(z.number(), 100),
  h: zSafe(z.number(), 100),
  r: zSafe(z.number(), 0),
}).default({});

export type TransformRect = z.infer<typeof TransformRectSchema>;

export type ElementSceneState<T = any> = {
  rect: TransformRect;
  data: T;
};

export const ElementSceneStateFactory = (type: ElementType) => z.object({
  active: zSafe(z.boolean(), true),
  rect: zSafe(TransformRectSchema, {x: 0,y: 0,w: 100,h: 100,r: 0}),
  data: ElementSchemaMap[type]
}).default({});


export const UnionElementStateSchema = z.discriminatedUnion("type", [
  ElementStateFactory(ElementType.image, Element_ImageStateSchemaN),
  ElementStateFactory(ElementType.text, Element_TextStateSchemaN),
]);
export type ElementState = z.infer<typeof UnionElementStateSchema>;

export function ElementStateFactory(type: ElementType, elementDataSchema: z.ZodDefault<z.AnyZodObject>) {
  return z.object({
    id: zSafe(z.string(), ""),
    name: zSafe(z.string(), "Unnamed element"),
    type: z.literal(type),
    scenes: zSafe(z.record(z.string(), ElementSceneStateFactory(type)), {})
  });
}
