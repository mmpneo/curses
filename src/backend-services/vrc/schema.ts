import {JSONSchemaType} from "ajv";
import { TextEventSource } from "../../types";

export type VRC_State = {
  source: TextEventSource,
  inputField: boolean,
  indicator: boolean
};

const Schema_VRC: JSONSchemaType<VRC_State> = {
  type: "object",
  properties: {
    source: {type: "string", default: TextEventSource.stt},
    inputField: {type: "boolean", default: false},
    indicator: {type: "boolean", default: false},
  },
  required: ["source", "inputField", "indicator"],
  default: {},
  additionalProperties: false
}

export default Schema_VRC
