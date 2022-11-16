import {JSONSchemaType} from "ajv";

export type VRC_State = {
  sendStt: boolean,
  sendText: boolean,
  indicator: boolean,
  // interim: boolean
};

const Schema_VRC: JSONSchemaType<VRC_State> = {
  type: "object",
  properties: {
    sendStt: {type: "boolean", default: false},
    sendText: {type: "boolean", default: false},
    indicator: {type: "boolean", default: false},
    // interim: {type: "boolean", default: false},
  },
  required: ["sendStt", "sendText", "indicator"],
  default: {},
  additionalProperties: false
}

export default Schema_VRC
