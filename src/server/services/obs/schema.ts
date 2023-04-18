import { JSONSchemaType } from "ajv";
import { TextEventSource } from "@/types";

export type OBS_State = {
  enable: boolean;
  source: TextEventSource;
  inputField: boolean;
  interim: boolean;
  wsHost: string;
  wsAutoStart: boolean;
  wsPort: string;
  wsPassword: string;
};

const Schema_OBS: JSONSchemaType<OBS_State> = {
  type: "object",
  properties: {
    enable: { type: "boolean", default: false },
    source: { type: "string", default: TextEventSource.stt },
    inputField: { type: "boolean", default: false },
    interim: { type: "boolean", default: false },
    wsAutoStart: { type: "boolean", default: false },
    wsHost: { type: "string", default: "localhost" },
    wsPort: { type: "string", default: "4455" },
    wsPassword: { type: "string", default: "" },
  },
  required: [
    "enable",
    "source",
    "inputField",
    "interim",
    "wsAutoStart",
    "wsHost",
    "wsPort",
    "wsPassword",
  ],
  default: {},
  additionalProperties: false,
};

export default Schema_OBS;
