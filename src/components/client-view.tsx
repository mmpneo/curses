import { FC } from "react";
import Canvas from "./canvas";

const ClientView: FC = () => {
  return <div className="overflow-hidden w-screen h-screen flex items-center justify-center"><Canvas /></div>
}

export default ClientView;