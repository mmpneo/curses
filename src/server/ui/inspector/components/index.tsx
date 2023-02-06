import {FC, memo, PropsWithChildren, useId} from "react";
import SimpleBar                            from "simplebar-react";
import classNames                           from "classnames";
import {AnimatePresence, motion}            from "framer-motion";
import {Tab, Tabs, TabsContent}             from "@/server/ui/inspector/components/tabs";

const TabAnimation: FC<PropsWithChildren>                              = ({children}) => {
  const id = useId();
  return <motion.div
    key={id}
    initial={{x: -20, opacity: 0}}
    transition={{ease: "anticipate", duration: 0.3}}
    exit={{x: 20, opacity: 0}}
    animate={{x: 0, opacity: 1}}
    className="absolute inset-0">
    {children}
  </motion.div>
}
export const Body: FC<PropsWithChildren<{ scrollable?: boolean }>>     = ({scrollable, children}) => {
  return <TabAnimation>
    <SimpleBar className="h-full">
      {children}
    </SimpleBar>

  </TabAnimation>
}
export const Header: FC<PropsWithChildren>                             = memo(({children}) => {
  return <div className="flex font-header items-center gap-2 px-4 pt-4 text-xl font-extrabold">{children}</div>
})
export const SubHeader: FC<PropsWithChildren>                          = ({children}) => {
  return <span className="first:pt-0 pt-4">
    <span
      className="flex font-header font-bold text-primary justify-between items-center gap-2 whitespace-nowrap">{children}</span>
  </span>
}
export const Description: FC<PropsWithChildren>                        = ({children}) => {
  return <span>
    <span className="-mt-2 text-xs text-base-content/70 flex justify-between items-center gap-2">{children}</span>
  </span>
}
export const Content: FC<PropsWithChildren>                            = ({children}) => {
  return <div style={{width: '19rem'}} className="flex flex-col p-4 space-y-2">{children}</div>
}
export const Switchable: FC<PropsWithChildren<{ visible: boolean }>>   = ({visible, children}) => {
  return <AnimatePresence initial={false}>
    {visible && <motion.div
      key="switchable"
      initial={{marginTop: 0, height: 0, opacity: 0}}
      transition={{ease: "anticipate", duration: 0.3}}
      exit={{marginTop: 0, height: 0, opacity: 0}}
      animate={{marginTop: ".5rem", height: "auto", opacity: 1}}
      className="flex flex-col w-full space-y-2">
      <span></span>
      {children}
    </motion.div>}
  </AnimatePresence>
}
export const Deactivatable: FC<PropsWithChildren<{ active: boolean }>> = ({active, children}) => {
  return <div
    className={classNames("flex flex-col w-full space-y-2 transition-opacity", !active ? "opacity-50 pointer-events-none" : "")}>
    <span></span>
    {children}
  </div>
}

export const Deleted: FC = () => {
  return <div className="w-full h-full flex bg-red items-center justify-center">Deleted</div>

}

export default { Body, Header, SubHeader, Description, Content, Deactivatable, TabsContent, Tabs, Tab, Switchable, Deleted };
