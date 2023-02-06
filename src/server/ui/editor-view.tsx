import NiceModal from "@ebay/nice-modal-react";
import { FC, FormEvent, memo, useState } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { TextEventSource, TextEventType } from "@/types";
import Sidebar                            from "./sidebar";

import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot }                    from "valtio";
import ActionBar                          from "./actionbar";
import "./file-modal";
import OverlayInput                       from "./overlay-input";
import { ElementEditorTransform } from "./element-transform";
import { useGetState }            from "@/client";
import classNames                 from "classnames";
import { RiCheckFill }                    from "react-icons/ri";
import BackgroundInput                    from "./background-input";

const EditorView: FC = () => {
  const { showOverlay } = useSnapshot(window.ApiServer.state);
  return <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ease: "anticipate", duration: .4 }}
      className="relative bg-base-200 w-screen h-screen flex overflow-hidden">
      <NiceModal.Provider>
        <Sidebar />
        <div className="relative flex flex-col overflow-hidden w-full h-full">
          <ActionBar />
          <EditorViewport />
          <AnimatePresence initial={false}>
            {!showOverlay && <div className="absolute self-center bottom-4"><STTInput /></div>}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {showOverlay && <OverlayInput onClose={() => window.ApiServer.state.showOverlay = false} />}
        </AnimatePresence>
        <ShortcutRecorder />
        <BackgroundInput />
        <ToastContainer className="toasts" draggable={false} closeOnClick limit={3} hideProgressBar theme="colored" />
      </NiceModal.Provider>
    </motion.div>
  </AnimatePresence>
}

const ShortcutRecorder: FC = () => {
  const { showRecorder, currentValue } = useSnapshot(window.ApiServer.keyboard.ui);

  return <AnimatePresence>
    {showRecorder && <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: "anticipate", duration: 0.3 }}
      className="fixed inset-0 z-50 bg-base-300/90 flex flex-col space-y-5 items-center justify-center">
      {/* <span className="text-2xl">Recording hotkey</span> */}
      <span className={classNames("font-bold text-5xl", { "opacity-50": !currentValue })}>{currentValue || "Listening for input.."}</span>
      <div className="flex space-x-2">
        <button className="btn btn-sm btn-ghost gap-2 leading-none items-center" onClick={() => window.ApiServer.keyboard.cancelComboRecord()}>Cancel</button>
        <button className="btn btn-sm btn-primary gap-2 leading-none items-center" onClick={() => window.ApiServer.keyboard.confirmShortcutRecord()}><RiCheckFill className="text-xl" /> Update shortcut</button>
      </div>
    </motion.div>}
  </AnimatePresence>
}

const Canvas: FC = memo(() => {
  const canvas = useGetState(state => state.canvas);
  const ids = useGetState(state => state.elementsIds);
  return <>
    <div style={{ width: canvas?.w, height: canvas?.h }} className="relative">
      {ids?.map((elementId) => <ElementEditorTransform id={elementId} key={elementId} />)}
    </div>
  </>
})

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
    window.ApiShared.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.final, value: inputValue });
  }

  const handleChange = (value: string) => {
    window.ApiShared.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.interim, value });
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
      <input type="text" autoComplete="off" name="sttinput" placeholder="Type something and press [Enter]" className="w-full textarea" value={inputValue} onChange={e => handleChange(e.target.value)} />
    </form>
  </motion.div>
}

export default EditorView;
