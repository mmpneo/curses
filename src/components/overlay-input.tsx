import { motion } from "framer-motion";
import { FC, forwardRef, useState } from "react";
import { RiCloseFill, RiSendPlaneFill } from "react-icons/ri";
import { TextEventSource, TextEventType } from "../types";

const variants = {
  show: {
    opacity: 1,
    // y: '0',
    scale: 1,
    transition: { ease: "anticipate", duration: 0.3 }
  },
  hidden: {
    opacity: 0,
    // y: '-5vh',
    scale: 1.03,
    transition: { ease: "anticipate", duration: 0.3 }
  },
}

const OverlayInput: FC<{ onClose: () => void }> = forwardRef(({ onClose }, ref: any) => {
  const [inputValue, setInputValue] = useState('');
  const submit = () => {
    if (!inputValue)
      return;
    setInputValue('');
    window.API.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.final, value: inputValue });
  }

  const handleChange = (value: string) => {
    window.API.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.interim, value });
    setInputValue(value);
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit();
    }
  }

  return <motion.div
    key="overlay-input"
    ref={ref}
    variants={variants}
    initial="hidden"
    animate="show"
    exit="hidden" className="absolute z-50 h-screen inset-x-0 pointer-events-none">
    <div className="absolute pointer-events-none top-0 h-12 bg-base-300/40 w-full"></div>
    <div className="absolute pointer-events-auto top-12 bottom-0 w-screen bg-base-300/90 text-base-content">
      <textarea
        placeholder="Start typing ..now (◔◡◔)🔪"
        autoFocus
        onKeyDown={handleKey}
        autoComplete="false"
        spellCheck="false"
        className="absolute inset-0 bg-transparent resize-none text-5xl pt-4 px-6 outline-none font-medium"
        value={inputValue}
        onChange={e => handleChange(e.target.value)}></textarea>
      {/* <button className="absolute top-2 right-4 btn btn-xl btn-circle btn-primary text-2xl" onClick={onClose}><RiCloseFill /></button> */}
      <button className="absolute bottom-4 right-4 btn btn-xl text-xl btn-primary gap-2" onClick={submit}>Send <RiSendPlaneFill /></button>
    </div>

  </motion.div>
})
export default OverlayInput;

