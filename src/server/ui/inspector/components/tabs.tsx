import {ButtonHTMLAttributes, FC, forwardRef, memo, PropsWithChildren, useState} from "react";
import {AnimatePresence, motion}                                                 from "framer-motion";
import Tooltip                                                                   from "@/server/ui/dropdown/Tooltip";
import classNames                                                                from "classnames";

const variants                                                                                                                                = {
  enter:  (direction: number) => {
    return {
      x:       direction > 0 ? 50 : -50,
      opacity: 0
    };
  },
  center: {
    x:       0,
    opacity: 1
  },
  exit:   (direction: number) => {
    return {
      x:       direction < 0 ? 50 : -50,
      opacity: 0
    };
  }
};
export const useInspectorTabs                                                                                                                 = () => {
  const [[tab, direction], setTab] = useState<[number, number]>([0, 0]);
  const handleTab                  = (v: number) => {
    setTab([v, Math.sign(v - tab)]);
  }
  return [[tab, direction], handleTab] as [[number, number], (v: number) => void];
}
export const TabsContent: FC<PropsWithChildren<{ tabKey: number | string, direction: number }>>                                               = forwardRef(({
  children,
  tabKey,
  direction
}, ref: any) => {
  return <div>
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <motion.div
        key={tabKey}
        ref={ref}
        variants={variants}
        custom={direction}
        transition={{ease: "anticipate", duration: 0.3}}
        exit="exit"
        initial="enter"
        animate="center"
        className="flex flex-col space-y-2"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  </div>
});
export const Tabs: FC<PropsWithChildren> = ({children}) => {
  return <div className="flex justify-center border-b-2 border-neutral border-solid">
    {children}
  </div>
}
export const Tab: FC<PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { tooltip: string, tooltipBody?: string, active: boolean }>> = memo(({
  children,
  tooltipBody,
  tooltip,
  active,
  ...props
}) => {
  const colors = active ? "border-primary text-primary" : "border-transparent text-base-content/60 hover:text-base-content"
  return <Tooltip className="relative" placement="bottom" content={tooltip} body={tooltipBody}>
    <button {...props} className={classNames("text-lg min-w-[3rem] flex justify-center p-2 border-b-2 border-solid mb-[-1px] transition-colors", colors)}>{children}</button>
  </Tooltip>
})
