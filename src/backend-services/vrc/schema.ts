import {JSONSchemaType} from "ajv";
import { TextEventSource } from "../../types";

export type VRC_State = {
  enable: boolean;
  source: TextEventSource;
  inputField: boolean;
  indicator: boolean;
};

const Schema_VRC: JSONSchemaType<VRC_State> = {
  type: "object",
  properties: {
    enable: {type: "boolean", default: false},
    source: {type: "string", default: TextEventSource.stt},
    inputField: {type: "boolean", default: false},
    indicator: {type: "boolean", default: false},
  },
  required: ["enable", "source", "inputField", "indicator"],
  default: {},
  additionalProperties: false
}

export default Schema_VRC
