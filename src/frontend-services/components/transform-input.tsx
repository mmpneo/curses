import { FC } from "react";
import { useGetState, useUpdateState } from "..";
import Input from "../../components/input";
import { TransformRect } from "../schema/transform-rect";

const TransformInput: FC<{id: string}> = ({id}) => {
  const rect = useGetState(state => state.elements[id].scenes["main"].rect);
  const update = useUpdateState();

  const handleUpdate = (key: keyof TransformRect, value: string) => update(state => {
    state.elements[id].scenes["main"].rect[key] = parseFloat(value);
  });

  return <>
    <Input.DoubleCountainer label="Position">
        <Input.BaseText value={rect?.x} onChange={e => handleUpdate("x", e.target.value)} type="number"/>
        <Input.BaseText value={rect?.y} onChange={e => handleUpdate("y", e.target.value)} type="number"/>
    </Input.DoubleCountainer>
    <Input.DoubleCountainer label="Size">
        <Input.BaseText value={rect?.w} onChange={e => handleUpdate("w", e.target.value)} type="number"/>
        <Input.BaseText value={rect?.h} onChange={e => handleUpdate("h", e.target.value)} type="number"/>
    </Input.DoubleCountainer>
  </>
}

export default TransformInput