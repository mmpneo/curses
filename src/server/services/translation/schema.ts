import { JSONSchemaType } from "ajv";

export enum Translation_Backends {
  azure = "azure",
}

type AzureTranslationProfanity = "Deleted" | "Marked" | "NoAction";

export type Translation_State = {
  backend: Translation_Backends;
  autoStart: boolean;
  inputField: boolean;
  azure: {
    key: string;
    location: string;
    languageFrom: string;
    language: string;
    profanity: AzureTranslationProfanity;
    interim: boolean;
  };
};

const Schema_Translation: JSONSchemaType<Translation_State> = {
  type: "object",
  properties: {
    backend: { type: "string", default: Translation_Backends.azure },
    autoStart: { type: "boolean", default: false },
    inputField: { type: "boolean", default: true },
    azure: {
      type: "object",
      properties: {
        languageFrom: { type: "string", default: "en" },
        language: { type: "string", default: "en" },
        key: { type: "string", default: "" },
        location: { type: "string", default: "" },
        profanity: { type: "string", default: "Marked" },
        interim: { type: "boolean", default: true },
      },
      required: [
        "languageFrom",
        "language",
        "key",
        "location",
        "profanity",
        "interim",
      ],
      default: {} as any,
      additionalProperties: false,
    },
  },
  required: ["backend", "autoStart", "inputField", "azure"],
  default: {},
  additionalProperties: false,
};

export default Schema_Translation;
