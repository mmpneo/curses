import { FC }                          from "react";
import { useGetState, useUpdateState } from "@/client";
import { InputBaseText, InputDoubleCountainer }                           from "./input";
import {TransformRect}                 from "@/client/elements/schema";
import { useSnapshot } from "valtio";

const TransformInput: FC<{id: string}> = ({id}) => {
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const rect = useGetState(state => state.elements[id].scenes[activeScene]?.rect);
  const update = useUpdateState();

  const handleUpdate = (key: keyof TransformRect, value: string) => update(state => {
    state.elements[id].scenes[activeScene].rect[key] = parseFloat(value);
  });

  return <>
    <InputDoubleCountainer label="common.field_position">
        <InputBaseText value={rect?.x} onChange={e => handleUpdate("x", e.target.value)} type="number"/>
        <InputBaseText value={rect?.y} onChange={e => handleUpdate("y", e.target.value)} type="number"/>
    </InputDoubleCountainer>
    <InputDoubleCountainer label="common.field_size">
        <InputBaseText value={rect?.w} onChange={e => handleUpdate("w", e.target.value)} type="number"/>
        <InputBaseText value={rect?.h} onChange={e => handleUpdate("h", e.target.value)} type="number"/>
    </InputDoubleCountainer>
  </>
}

export default TransformInput
