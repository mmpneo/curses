import {JSONSchemaType} from "ajv";

export type VRC_State = {
  indicator: boolean
};

const Schema_VRC: JSONSchemaType<VRC_State> = {
  type: "object",
  properties: {
    indicator: {type: "boolean", default: false}
  },
  required: ["indicator"],
  default: {}
}

export default Schema_VRC
