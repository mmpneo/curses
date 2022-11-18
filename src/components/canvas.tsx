import {FC} from "react";
import { useGetState } from "../frontend-services";

const Canvas: FC =() => {
  const state = useGetState(state => state.canvas);
  return <div style={{width: state?.w, height: state?.h}} className="w-full h-full flex items-center justify-center">
    asd
  </div>
}

export default Canvas;
