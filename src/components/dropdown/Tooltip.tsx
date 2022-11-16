import {FC, PropsWithChildren, ReactNode, useRef, useState}                               from "react";
import {arrow, autoPlacement, autoUpdate, offset, useFloating, useHover, useInteractions} from "@floating-ui/react-dom-interactions";
import {Placement}                                                                        from "@floating-ui/dom";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  content: ReactNode,
  interact?: "hover" | "click",
  placement?: Placement[]
}

const Tooltip: FC<PropsWithChildren<Props>> = ({children, content, placement = ["top","bottom"]}) => {
  const arrowRef                              = useRef(null);
  const [open, setOpen]                       = useState(false);
  const {x, y, reference, floating, strategy, context, middlewareData: {arrow: {x: arrowX, y: arrowY} = {}}}= useFloating({
    whileElementsMounted: autoUpdate,
    strategy:             "fixed",
    open,
    onOpenChange:         setOpen,
    middleware:           [
      autoPlacement({
        allowedPlacements: placement ?? ["bottom", "top"]
      }),
      offset(8),
      arrow({element: arrowRef}),
    ]
  });
  const {getReferenceProps, getFloatingProps} = useInteractions([
    useHover(context, {restMs: 50}),
  ])

  return <>
    <span {...getReferenceProps({
      onClick: () => setOpen(false)
    })} ref={reference}>{children}</span>
    <AnimatePresence>
      {open && <motion.span
        key="inspector"
        initial={{scale: 0.95, opacity: 0}}
        transition={{ease: "easeInOut", duration: 0.15}}
        exit={{scale: 0.95, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        className="p-1" {...getFloatingProps()} ref={floating} style={{
        margin:   0,
        position: strategy,
        top:      y ?? 0,
        left:     x ?? 0,
      }}>
        <div style={{top: arrowY ?? 0, left: arrowX ?? 0}} className="custom-tooltip-arrow" ref={arrowRef}></div>
        <div className="custom-tooltip">{content}</div>
      </motion.span>
      }
    </AnimatePresence>
  </>
}

export default Tooltip;
