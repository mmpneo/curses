import NiceModal from "@ebay/nice-modal-react";
import { FC, FormEvent, memo, useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { TextEventSource, TextEventType } from "@/types";
import Sidebar from "./sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";
import ActionBar from "./actionbar";
import "./file-modal";
import OverlayInput from "./overlay-input";
import { ElementEditorTransform } from "./element-transform";
import { useGetState } from "@/client";
import classNames from "classnames";
import { RiCheckFill } from "react-icons/ri";
import BackgroundInput from "./background-input";
import RecordingAlerts from "./recording-alerts";
import { useTranslation } from "react-i18next";

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
            {!showOverlay && <div className="absolute flex justify-center self-center bottom-4 left-4 right-4"><STTInput /></div>}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {showOverlay && <OverlayInput onClose={() => window.ApiServer.state.showOverlay = false} />}
        </AnimatePresence>
        <ShortcutRecorder />
        <BackgroundInput />
        <AnimatePresence>
          {!showOverlay && <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: "anticipate", duration: 0.3 }}
            className="absolute top-16 right-4">
            <RecordingAlerts />
          </motion.div>}
        </AnimatePresence>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: "anticipate", duration: 0.3 }}
      style={{ width: canvas?.w, height: canvas?.h }} className="relative rounded-lg border border-dashed border-primary/50">
        {ids?.map((elementId) => <ElementEditorTransform id={elementId} key={elementId} />)}
    </motion.div>
  </>
})

const LogsView = () => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const { lastId, list } = useSnapshot(window.ApiShared.pubsub.textHistory);

  useEffect(() => {
    setTimeout(() => scrollContainer.current?.scrollTo({ top: scrollContainer.current.scrollHeight, behavior: "smooth" }));
  }, [lastId]);

  return <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ ease: "anticipate", duration: 0.3 }}
    className="relative w-full h-full flex flex-col">
    <div ref={scrollContainer} className="flex flex-grow overflow-y-scroll scrollbar-hide flex-col-reverse mb-8">
      <div className="w-full flex flex-col px-4 pt-6 pb-12 space-y-2">
        {list.map(event => <div key={event.id} className="flex flex-col rounded-md bg-neutral/10 hover:bg-neutral/30 transition-colors px-4 py-2 cursor-pointer">
          <div className="hidden sm:block text-xs opacity-50 font-semibold">from {event.event}</div>
          <div className="text-sm sm:text-lg font-semibold !leading-none">{event.value}</div>
        </div>)}
      </div>
    </div>
  </motion.div>
}

export const EditorViewport: FC = () => {
  const { showLogs } = useSnapshot(window.ApiServer.state);
  return <div className="w-full relative bg-base-300 rounded-tl-box flex flex-grow items-center justify-center overflow-hidden">
    <AnimatePresence>
      {showLogs ? <LogsView /> : <Canvas />}
    </AnimatePresence>
  </div>
}

const STTInput: FC = () => {
  const { showLogs } = useSnapshot(window.ApiServer.state);
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue) {
      setInputValue('');
      window.ApiShared.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.final, value: inputValue });
    }
  }

  const handleChange = (value: string) => {
    window.ApiShared.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.interim, value });
    setInputValue(value);
  }

  return <motion.div
    key="overlay-input"
    initial={{ opacity: 0, y: 10, width: showLogs ? '100%' : '400px' }}
    exit={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, width: showLogs ? '100%' : '400px', y: 0 }}
    transition={{ ease: "anticipate", duration: 0.5 }}
    className="flex items-center space-x-2 w-96">
    {/* <button className="btn btn-circle btn-ghost"><RiChatDeleteFill/></button> */}
    <form onSubmit={submit} className="w-full">
      <input type="text" autoComplete="off" name="sttinput" placeholder={t('main.keyboard_input')} className="w-full input text-sm" value={inputValue} onChange={e => handleChange(e.target.value)} />
    </form>
  </motion.div>
}

export default EditorView;
