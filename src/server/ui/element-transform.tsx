import { useGetState, useUpdateState } from "@/client";
import { TransformRect } from "@/client/elements/schema";
import { ElementInstance } from "@/client/ui/element-instance";
import classNames from "classnames";
import { FC, memo, useEffect, useState, MouseEvent as ReactMouseEvent } from "react";
import { useDebounce } from "react-use";
import { useSnapshot } from "valtio";

type TransformDirection = 'n' | 'e' | 's' | 'w' | 'nw' | 'ne' | 'se' | 'sw' | 'm';

function compareRect(a?: TransformRect, b?: TransformRect) {
  return !!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

export const ElementEditorTransform: FC<{ id: string }> = memo(({ id }) => {
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const docRect = useGetState(state => state.elements[id].scenes[activeScene]?.rect);
  const [rect, setRect] = useState<TransformRect>(window.ApiClient.document.fileBinder.get().elements[id].scenes[activeScene]?.rect);

  const update = useUpdateState();

  useEffect(() => {
    setRect(window.ApiClient.document.fileBinder.get().elements[id].scenes[activeScene]?.rect);
  }, [activeScene, docRect]);

  useDebounce(() => {
    update(state => {
      if (!compareRect(rect, state.elements[id].scenes[activeScene].rect)) {
        state.elements[id].scenes[activeScene].rect = rect;
      }
    });
  }, 100, [rect]);

  const { tab, show } = useSnapshot(window.ApiServer.ui.sidebarState);

  const selected = show && tab?.value === id;

  const selectElement = () => {
    const state = window.ApiClient.document.fileBinder.get();
    const element = state.elements[id]
    window.ApiServer.changeTab({ tab: element.type, value: id });
  }

  const [mouseDown, setMouseDown] = useState(false);
  const [transformDirection, setTransformDirection] = useState<TransformDirection>();

  const handleMove = (e: MouseEvent) => {
    selected && setRect(oldRect => {
      const rect = {...oldRect};
      if (transformDirection === 'n') {
        rect.y += e.movementY;
        rect.h -= e.movementY;
      }
      else if (transformDirection === 'e') {
        rect.w += e.movementX;
      }
      else if (transformDirection === 's') {
        rect.h += e.movementY;
      }
      else if (transformDirection === 'w') {
        rect.x += e.movementX;
        rect.w -= e.movementX;
      }
      else if (transformDirection === 'nw') {
        rect.y += e.movementY;
        rect.h -= e.movementY;
        rect.x += e.movementX;
        rect.w -= e.movementX;
      }
      else if (transformDirection === 'ne') {
        rect.y += e.movementY;
        rect.h -= e.movementY;
        rect.w += e.movementX;
      }
      else if (transformDirection === 'se') {
        rect.h += e.movementY;
        rect.w += e.movementX;
      }
      else if (transformDirection === 'sw') {
        rect.h += e.movementY;
        rect.x += e.movementX;
        rect.w -= e.movementX;
      }
      else if (transformDirection === 'm') {
        rect.x += e.movementX;
        rect.y += e.movementY;
      }
      rect.y = Math.round(rect.y);
      rect.h = Math.round(rect.h);
      rect.x = Math.round(rect.x);
      rect.w = Math.round(rect.w);
      return rect;
    });
  };

  useEffect(() => {
    if (mouseDown)
      window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseDown, transformDirection]);

  useEffect(() => {
    const removeDrag = () => setMouseDown(false);
    window.addEventListener("mouseup", removeDrag);
    return () => window.removeEventListener("mousemove", removeDrag);
  }, []);

  const handleDragDown = (direction: TransformDirection) => {
    return (e: ReactMouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setMouseDown(true);
      setTransformDirection(direction);
    }
  }

  if (!rect)
    return null;

  return <div onDoubleClick={selectElement} className={classNames("group absolute inset-0", {"transition-all duration-100": !selected, "z-50": selected})}
    style={{
      width: rect?.w || 0,
      height: rect?.h || 0,
      left: rect?.x || 0,
      top: rect?.y || 0,
    }}>
      <ElementInstance id={id} />
      <div onMouseDown={handleDragDown("m")} className={classNames("absolute inset-0 border-2 border-dashed opacity-0 border-secondary/50 transition-opacity",
        selected ? "opacity-100 border-primary cursor-move" : "group-hover:opacity-30 border border-dashed border-b-primary cursor-pointer"
      )}>
        <div onMouseDown={handleDragDown("n")} className="cursor-n-resize absolute -top-1 w-full h-1"></div>
        <div onMouseDown={handleDragDown("e")} className="cursor-e-resize absolute -right-1 h-full w-1"></div>
        <div onMouseDown={handleDragDown("s")} className="cursor-s-resize absolute -bottom-1 w-full h-1"></div>
        <div onMouseDown={handleDragDown("w")} className="cursor-w-resize absolute -left-1 h-full w-1"></div>

        <div onMouseDown={handleDragDown("nw")} className="cursor-nw-resize absolute -top-1 -left-1 rounded-full bg-primary w-2 h-2"></div>
        <div onMouseDown={handleDragDown("ne")} className="cursor-ne-resize absolute -top-1 -right-1 rounded-full bg-primary w-2 h-2"></div>
        <div onMouseDown={handleDragDown("se")} className="cursor-se-resize absolute -bottom-1 -right-1 rounded-full bg-primary w-2 h-2"></div>
        <div onMouseDown={handleDragDown("sw")} className="cursor-sw-resize absolute -bottom-1 -left-1 rounded-full bg-primary w-2 h-2"></div>
      </div>
    </div>
});
