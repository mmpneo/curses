import NiceModal from "@ebay/nice-modal-react";
import { FC, FormEvent, useState } from "react";
import { ToastContainer, Zoom } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { TextEventSource, TextEventType } from "../types";
import Canvas from "./canvas";
import Sidebar from "./sidebar";

import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";
import ActionBar from "./actionbar";
import "./file-modal";
import OverlayInput from "./overlay-input";

const EditorView: FC = () => {
  const { fullscreenInput } = useSnapshot(window.API.ui);
  return <div className="relative bg-base-200 w-screen h-screen flex overflow-hidden">
    <NiceModal.Provider>
      <Sidebar />
      <div className="relative flex flex-col w-full h-full">
        <ActionBar />
        <EditorViewport />
        <AnimatePresence initial={false}>
          {!fullscreenInput && <div className="absolute self-center bottom-4"><STTInput /></div>}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {fullscreenInput && <OverlayInput onClose={() => window.API.ui.fullscreenInput = false} />}
      </AnimatePresence>
      <ToastContainer hideProgressBar theme="dark" transition={Zoom} />
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

  return <div onMouseDown={event => event.button === 1 && handleStartPan(event)} className="w-full relative bg-base-300 rounded-tl-box flex flex-grow items-center justify-center overflow-hidden">
    <div className="rounded-lg border border-dashed border-primary/50" style={{
      transform: `translate3d(${x}px, ${y}px, 0px)`,
    }}>
      <Canvas />
    </div>
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

  return <motion.div
    key="overlay-input"
    initial={{ opacity: 0, y: 10 }}
    exit={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ease: "anticipate", duration: 0.5 }}
    className="flex items-center space-x-2 w-96">
    {/* <button className="btn btn-circle btn-ghost"><RiChatDeleteFill/></button> */}
    <form onSubmit={submit} className="w-full">
      <input type="text" autoComplete="off" name="sttimput" placeholder="Type something and press [Enter]" className="w-full textarea" value={inputValue} onChange={e => handleChange(e.target.value)} />
    </form>
  </motion.div>
}

export default EditorView;
