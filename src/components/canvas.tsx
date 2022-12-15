import { FC, memo } from "react";
import { useGetState } from "../frontend-services";
import { ElementEditorTransform, ElementSimpleTransform } from "./element-transform";
const Canvas: FC = memo(() => {
  const canvas = useGetState(state => state.canvas);
  const ids = useGetState(state => state.elementsIds);

  if (window.mode === "client") {
    return <div style={{ width: canvas?.w, height: canvas?.h }} className="relative">
      {ids?.map((elementId) => <ElementSimpleTransform id={elementId} key={elementId} />)}
    </div>
  }
  return <div style={{ width: canvas?.w, height: canvas?.h }} className="relative">
    {ids?.map((elementId) => <ElementEditorTransform id={elementId} key={elementId} />)}
  </div>
})

export default Canvas;
