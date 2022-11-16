import {createContext, FC, PropsWithChildren, ReactNode, useContext, useRef, useState}                                     from "react";
import {arrow, offset, autoUpdate, flip, safePolygon, shift, useClick, useDismiss, useFloating, useHover, useInteractions} from "@floating-ui/react-dom-interactions";
import {Placement}                                                                                                         from "@floating-ui/dom";

interface Props {
  content: ReactNode,
  interact?: "hover" | "click" | "context",
  placement?: Placement
}

export function useDropdown() {
  const dropdown = useContext(dropdownContext)
  return dropdown;
}

export const dropdownContext = createContext({
  close: () => {}
});

const Dropdown: FC<PropsWithChildren<Props>> = ({children, content, interact = "click", placement = "bottom"}) => {
  const arrowRef        = useRef(null);
  const [open, setOpen] = useState(false);
  const {x, y, reference, floating, strategy, context, middlewareData: {arrow: {x: arrowX, y: arrowY} = {}}} = useFloating({
    whileElementsMounted: autoUpdate,
    strategy: "fixed",
    placement,
    open,
    onOpenChange: setOpen,
    middleware:   [
      shift(),
      offset(14),
      flip(),
      arrow({element: arrowRef, padding: 20})
    ]
  });
  const { getReferenceProps, getFloatingProps} = useInteractions([
    useClick(context, {enabled: interact === "click"}),
    useHover(context, {enabled: interact === "hover", handleClose: safePolygon({restMs: 25})}),
    useDismiss(context),
  ]);

  const handleContext = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (interact !== "context")
      return;
    event.preventDefault();
    setOpen(true);
  }

  return <dropdownContext.Provider value={{close: () => setOpen(false)}}>
    <span onContextMenu={handleContext} {...getReferenceProps()} ref={reference}>{children}</span>
    {open && <span className="z-50 p-1" {...getFloatingProps()} ref={floating} style={{
      margin: 0,
      position: strategy,
      top:      y ?? 0,
      left:     x ?? 0,
    }}>
      <div style={{
        top:  arrowY ?? 0,
        left: arrowX ?? 0,
      }} className="dropdown-arrow" ref={arrowRef}/>
      {content}
    </span>}
  </dropdownContext.Provider>
}

export default Dropdown;
