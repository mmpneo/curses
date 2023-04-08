import { createContext, FC, HtmlHTMLAttributes, memo, PropsWithChildren, ReactNode, useContext, useRef, useState } from "react";
import { arrow, offset, autoUpdate, flip, safePolygon, shift, useClick, useDismiss, useFloating, useHover, useInteractions, FloatingPortal } from "@floating-ui/react-dom-interactions";
import { Placement } from "@floating-ui/react-dom";
import { AnimatePresence, motion } from "framer-motion";
interface Props {
  content: ReactNode,
  interact?: "hover" | "click" | "context",
  placement?: Placement
  targetOffset?: number
}

export function useDropdown() {
  const dropdown = useContext(dropdownContext)
  return dropdown;
}

export const dropdownContext = createContext({
  close: () => { }
});

const Dropdown: FC<PropsWithChildren<Omit<HtmlHTMLAttributes<HTMLSpanElement>, "content"> & Props>> = memo(({ children, content, interact = "click", placement = "bottom", targetOffset = 8, ...props }) => {
  const arrowRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { x, y, reference, floating, strategy, context, middlewareData: { arrow: { x: arrowX, y: arrowY } = {} } } = useFloating({
    whileElementsMounted: autoUpdate,
    strategy: "fixed",
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [
      shift({padding: 8}),
      offset(targetOffset),
      flip(),
      arrow({ element: arrowRef, padding: 20 })
    ]
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context, { enabled: interact === "click" }),
    useHover(context, { enabled: interact === "hover", handleClose: safePolygon({ restMs: 25 }) }),
    useDismiss(context),
  ]);

  const handleContext = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (interact !== "context")
      return;
    event.preventDefault();
    setOpen(true);
  }

  return <dropdownContext.Provider value={{ close: () => setOpen(false) }}>
    <span {...props} onContextMenu={handleContext} {...getReferenceProps()} ref={reference}>{children}</span>

    <FloatingPortal id="floating-elements">
      <AnimatePresence initial={false}>
        {open && <motion.span
          key="inspector"
          initial={{ scale: 0.95, opacity: 0 }}
          transition={{ ease: "anticipate", duration: 0.15 }}
          exit={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="z-50 shadow-lg rounded-box" {...getFloatingProps()} ref={floating} style={{margin: 0,position: strategy,top: y ?? 0,left: x ?? 0,}}>
          <div style={{ top: arrowY ?? 0, left: arrowX ?? -5 }} className="dropdown-arrow" ref={arrowRef} />
          {content}
        </motion.span>
        }
      </AnimatePresence>
    </FloatingPortal>
  </dropdownContext.Provider>
})

export default Dropdown;
