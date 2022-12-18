import NiceModal from "@ebay/nice-modal-react";
import { FC, FormEvent, useState } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { TextEventSource, TextEventType } from "../types";
import Actionbar from "./actionbar";
import Canvas from "./canvas";
import Sidebar from "./sidebar";

import { useSnapshot } from "valtio";
import "./file-modal";
import OverlayInput from "./overlay-input";
import { AnimatePresence } from "framer-motion";

const EditorView: FC = () => {
  const {fullscreenInput} = useSnapshot(window.API.ui);
  return <div className="relative bg-base-300 w-screen h-screen flex overflow-hidden">
    <NiceModal.Provider>
      <Sidebar />
      <EditorViewport />
      <div className="absolute top-3 right-4">
        <Actionbar />
      </div>
      <AnimatePresence>
        {fullscreenInput && <OverlayInput onClose={() => window.API.ui.fullscreenInput = false} />}
      </AnimatePresence>
      <ToastContainer />
    </NiceModal.Provider>
  </div>
}

export const EditorViewport: FC = () => {
  const [[x, y], setTranslate] = useState([0, 0]);

  const handleStartPan = (e: any) => {
    const onUp = () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mousemove", onMove);
    }
    const onMove = (e: any) => setTranslate(([oldX, oldY]) => [oldX + e.movementX, oldY + e.movementY])
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mousemove", onMove);
  }

  return <div onMouseDown={event => event.button === 1 && handleStartPan(event)} className="relative flex flex-grow items-center justify-center overflow-hidden">
    <div className="rounded-lg border-2 border-dashed border-base-100" style={{
      transform: `translate3d(${x}px, ${y}px, 0px)`,
    }}>
      <Canvas />
    </div>
    <div className="absolute bottom-4"><STTInput /></div>
  </div>
}

const STTInput: FC = () => {
  const [inputValue, setInputValue] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue)
      return;
    setInputValue('');
    window.API.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.final, value: inputValue });
  }

  const handleChange = (value: string) => {
    window.API.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.interim, value });
    setInputValue(value);
  }

  return <div className="flex items-center space-x-2 w-96">
    {/* <button className="btn btn-circle btn-ghost"><RiChatDeleteFill/></button> */}
    <form onSubmit={submit} className="w-full">
      <input type="text" autoComplete="off" name="sttimput" placeholder="Type something and press [Enter]" className="w-full textarea" value={inputValue} onChange={e => handleChange(e.target.value)} />
    </form>
  </div>
}

export default EditorView;
