import { JSONSchemaType } from "ajv";

export type Element_ImageState = {
  fileId: string;
  styleOpacity: number;

  activeFileId: string;
  activeStyleOpacity: number;

  activeEvent: string;
  activeDuration: number;
  activeTransitionDuration: number;
  styleCss: string;
};

export const Element_ImageStateSchema: JSONSchemaType<Element_ImageState> = {
  type: "object",
  properties: {
    fileId: { type: "string", default: "" },
    styleOpacity: { type: "number", default: 1 },

    activeEvent: { type: "string", default: "" },
    activeFileId: { type: "string", default: "" },
    activeStyleOpacity: { type: "number", default: 1 },
    activeDuration: { type: "number", default: 100 },
    activeTransitionDuration: { type: "number", default: 100 },


    styleCss: { type: "string", default: "" },
  },
  additionalProperties: false,
  default: {},
  required: [
    "fileId",
    "styleOpacity",

    "activeEvent",
    "activeFileId",
    "activeStyleOpacity",
    "activeDuration",
    "activeTransitionDuration",

    "styleCss"
  ],
};
