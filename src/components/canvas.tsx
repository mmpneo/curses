import { FC, memo, useEffect } from "react";
import { useGetState } from "../frontend-services";
import ElementTransform from "./element-transform";
const Canvas: FC = memo(() => {
  const canvas = useGetState(state => state.canvas);
  const ids = useGetState(state => state.elementsIds);

  useEffect(() => console.log("render"), [ids])

  return <div style={{ width: canvas?.w, height: canvas?.h }} className="w-full h-full flex items-center justify-center">
    {ids?.map((elementId) => <ElementTransform id={elementId} key={elementId} />)}
  </div>
})

export default Canvas;
