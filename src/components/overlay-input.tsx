import { motion } from "framer-motion";
import { FC, useState } from "react";
import { RiCloseFill, RiSendPlaneFill } from "react-icons/ri";
import { TextEventSource, TextEventType } from "../types";

const variants = {
  show: {
    opacity: 1, 
    // top: '0',
    transition: { ease: "anticipate", duration: 0.4 }
  },
  hidden: {
    opacity: 0,
    // top: '100vh',
    transition: { ease: "easeInOut", duration: 0.2 }
  },
}

const OverlayInput: FC<{ onClose: () => void }> = ({ onClose }) => {
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
    variants={variants}
    initial="hidden"
    animate="show"
    exit="hidden"
    className="absolute w-screen h-screen bg-black/80 z-50 text-white">
    <textarea autoFocus onKeyDown={handleKey} autoComplete="false" spellCheck="false" className="absolute inset-0 bg-transparent text-5xl p-8 outline-none" value={inputValue} onChange={e => handleChange(e.target.value)}></textarea>
    <button className="absolute top-4 right-4 btn btn-xl btn-circle btn-primary text-2xl" onClick={onClose}><RiCloseFill /></button>
    <button className="absolute bottom-4 right-4 btn btn-xl text-xl btn-primary gap-2" onClick={submit}>Send <RiSendPlaneFill /></button>
  </motion.div>
}
export default OverlayInput;

