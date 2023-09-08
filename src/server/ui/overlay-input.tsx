import classNames from "classnames";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { FC, forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
import { TbArrowBarToLeft, TbArrowBarToRight } from "react-icons/tb";
import { useSnapshot }                    from "valtio";
import { TextEventSource, TextEventType } from "../../types";
import Tooltip                            from "./dropdown/Tooltip";
import RecordingAlerts from "./recording-alerts";

const overlayVariant = {
  show: {
    opacity: 1,
    scale: 1,
    transition: { ease: "anticipate", duration: 0.3 }
  },
  hidden: {
    opacity: 0,
    scale: 1.03,
    transition: { ease: "anticipate", duration: 0.3 }
  },
}

const logsVariants = {
  show: {
    width: '15rem',
    opacity: 1,
    transition: { ease: "anticipate", duration: 0.3 }
  },
  hidden: {
    width: 0,
    opacity: 0,
    transition: { ease: "easeInOut", duration: 0.2 }
  },
}

const Logs: FC<{ onFillRequest: (value: string) => void }> = ({ onFillRequest }) => {
  const { lastId, list } = useSnapshot(window.ApiShared.pubsub.textHistory);
  const scrollContainer = useRef<HTMLDivElement>(null)
  useEffect(() => {
      setTimeout(() => scrollContainer.current?.scrollTo({ top: scrollContainer.current.scrollHeight, behavior: "smooth" }));
  }, [lastId]);

  return <div ref={scrollContainer} style={{ width: '15rem' }} className="h-full bg-neutral/30 flex overflow-y-scroll scrollbar-hide flex-col-reverse">
    <div className="w-full flex flex-col px-2 py-2 space-y-1">
      <span className="px-2 text-sm font-semibold">Text events</span>
      <span className="opacity-50 px-2 text-xs font-medium">ℹ Doubleclick event to insert it into text field</span>
      {list.map(event => <div key={event.id} onDoubleClick={() => onFillRequest(event.value)} className="flex flex-col rounded-md bg-neutral/10 hover:bg-neutral/30 transition-colors p-2 cursor-pointer">
        <div className="hidden sm:block text-xs opacity-50 font-semibold">from {event.event}</div>
        <div className="text-sm sm:text-lg font-bold !leading-none">{event.value}</div>
      </div>)}
    </div>
  </div>
}

const OverlayInput: FC<{ onClose: () => void }> = forwardRef(({ onClose }, ref: any) => {
  const { showOverlayLogs } = useSnapshot(window.ApiServer.state);
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [inputValue, setInputValue] = useState("");

  const submit = () => {
    window.ApiShared.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.final, value: inputValue });
    setInputValue("");
  }

  const handleChange = (value: string) => {
    window.ApiShared.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.interim, value: inputValue });
    setInputValue(value);

  };

  const insertLog = (value: string) => {
    inputRef.current?.focus();
    setInputValue(value);
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit();
    }
  }

  const handleLogsSwitch = () => {
    window.ApiServer.state.showOverlayLogs = !window.ApiServer.state.showOverlayLogs;
  };

  return <motion.div
    key="overlay-input"
    ref={ref}
    variants={overlayVariant}
    initial="hidden"
    animate="show"
    exit="hidden" className="absolute z-50 h-screen inset-x-0 pointer-events-none">
    <div className="absolute pointer-events-none top-0 h-12 bg-base-300/50 w-full"></div>
    <div className="absolute pointer-events-auto top-12 bottom-0 w-screen bg-base-300/90 text-base-content flex">
      <div className="relative flex-grow h-full">
        <textarea
          ref={inputRef}
          placeholder="Start typing ..now (◔◡◔)🔪"
          autoFocus
          onKeyDown={handleKey}
          autoComplete="false"
          className="absolute font-header inset-0 bg-transparent resize-none text-2xl sm:text-5xl pt-4 px-6 outline-none font-medium focus:placeholder-base-content/10 placeholder-base-content/30"
          value={inputValue}
          onChange={e => handleChange(e.target.value)}></textarea>

        <div className="flex absolute bottom-4 right-4 space-x-2 items-center">
          <RecordingAlerts/>
          <button className="hidden sm:flex btn btn-xl text-xl btn-primary gap-2" onClick={submit}>Send <RiSendPlaneFill /></button>
          <button className="flex sm:hidden btn btn-sm btn-primary gap-2" onClick={submit}>Send <RiSendPlaneFill /></button>
        </div>

        <Tooltip content={showOverlayLogs ? "Hide Logs" : "Show Logs"} className="absolute right-2 top-2">
          <button className="btn btn-sm btn-ghost btn-square border-none" onClick={handleLogsSwitch}>
            <span className={classNames("flex-none w-10 h-8 items-center justify-center text-lg text-base-content/50 swap swap-flip", { "swap-active": showOverlayLogs })}>
              <TbArrowBarToRight className="swap-on" />
              <TbArrowBarToLeft className="swap-off" />
            </span>
          </button>
        </Tooltip>
      </div>
      <motion.div animate={showOverlayLogs ? "show" : "hidden"} variants={logsVariants} initial={showOverlayLogs ? "show" : "hidden"} className="h-full flex-none">
        <Logs onFillRequest={v => insertLog(v)} />
      </motion.div>
    </div>
  </motion.div>
})
export default OverlayInput;

