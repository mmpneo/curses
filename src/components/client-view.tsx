import { FC, memo } from "react";
import { useGetState } from "../frontend-services";
import { ElementInstance } from "./element-instance";

export const ElementSimpleTransform: FC<{ id: string }> = memo(({ id }) => {
  const rect = useGetState(state => state.elements[id].scenes["main"].rect);
  return <div
    className="absolute"
    style={{
      width: rect?.w || 0,
      height: rect?.h || 0,
      left: rect?.x || 0,
      top: rect?.y || 0,
    }}
  >
    <ElementInstance id={id} />
  </div>
});

const ClientView: FC = () => {
  const canvas = useGetState(state => state.canvas);
  const ids = useGetState(state => state.elementsIds);
  return <div className="overflow-hidden w-screen h-screen flex items-center justify-center">
    <div style={{ width: canvas?.w, height: canvas?.h }} className="relative">
      {ids?.map((elementId) => <ElementSimpleTransform id={elementId} key={elementId} />)}
    </div>
  </div>
}

export default ClientView;