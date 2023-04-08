import classNames from "classnames/bind";
import { AnimatePresence, motion } from "framer-motion";
import { FC, memo } from "react";
import { useSnapshot } from "valtio";
import style           from "./background-input.module.css";

declare module 'react' {
  interface CSSProperties {
    "--size"?: string,
    "--value"?: string | number,
  }
}

const cx = classNames.bind(style)
const BackgroundInput: FC = memo(() => {
  const { backgroundInputActive, backgroundInputValue, backgroundTimer } = useSnapshot(window.ApiServer.keyboard.ui);

  return <AnimatePresence>
    {backgroundInputActive && <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: "anticipate", duration: 0.3 }}
      className={cx("fixed inset-x-4 top-4 p-4 flex flex-col space-y-2 border-4 rounded-box border-red-500 z-50 bg-base-300/90")}>
      <div className="flex justify-between items-center">
        <div className="leading-none font-header text-red-500 font-bold flex gap-2 items-center">
            <div className={cx(style.pulse, "w-4 h-4 rounded-full bg-red-500")}></div>
          Recording input
          <div className={style.progress}><div className="bg-red-500" style={{width: `${backgroundTimer}%`}} /></div>
        </div>
        <button className="btn btn-sm btn-ghost gap-2 leading-none items-center" onClick={() => window.ApiServer.keyboard.stopBackgroundInput()}>Cancel</button>
      </div>
      <div className={cx("font-header text-2xl sm:text-3xl outline-none font-medium", { "opacity-50": !backgroundInputValue })}>{backgroundInputValue || "Listening for input.."}</div>
    </motion.div>}
  </AnimatePresence>
});
export default BackgroundInput
