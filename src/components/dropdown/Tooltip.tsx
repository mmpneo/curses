import { FC, HTMLAttributes, HtmlHTMLAttributes, PropsWithChildren, ReactNode, useRef, useState } from "react";
import { arrow, autoPlacement, autoUpdate, FloatingPortal, offset, shift, useFloating, useHover, useInteractions } from "@floating-ui/react-dom-interactions";
import { Placement } from "@floating-ui/dom";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  enable?: boolean,
  content: ReactNode,
  body?: ReactNode,
  interact?: "hover" | "click",
  placement?: Placement[]
}

const Tooltip: FC<PropsWithChildren<HtmlHTMLAttributes<HTMLSpanElement> & Props>> = ({ enable = true, children, content, body, placement = ["top", "bottom"], ...props }) => {
  const arrowRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { x, y, reference, floating, strategy, context, middlewareData: { arrow: { x: arrowX, y: arrowY } = {} } } = useFloating({
    whileElementsMounted: autoUpdate,
    strategy: "fixed",
    open,
    onOpenChange: setOpen,
    middleware: [
      shift({padding: 8}),
      autoPlacement({allowedPlacements: placement ?? ["bottom", "top"]}),
      offset(8),
      arrow({ element: arrowRef }),
    ]
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { restMs: 0 }),
  ])


  return <>
    <span {...props} {...getReferenceProps({
      onClick: () => setOpen(false)
    })} ref={reference}>{children}</span>
    <FloatingPortal id="floating-elements">
      {enable && <AnimatePresence>
        {open && <motion.span
          key="inspector"
          initial={{ y: 5, scale: 0.95, opacity: 0 }}
          transition={{ ease: "anticipate", duration: 0.15 }}
          exit={{ y: 5, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          className="block fixed p-1" {...getFloatingProps()} ref={floating} style={{zIndex: 10000, margin: 0, position: strategy, top: y ?? 0, left: x ?? 0 }}>
          <div style={{ top: arrowY ?? 0, left: arrowX ?? 0 }} className="custom-tooltip-arrow" ref={arrowRef}></div>
          <div className="custom-tooltip flex flex-col">
            <span>{content}</span>
            {body && <span className="text-xs font-normal opacity-70">{body}</span>}
          </div>
        </motion.span>
        }
      </AnimatePresence>}
    </FloatingPortal>
  </>
}

export default Tooltip;
