import classNames from "classnames";
import { FC, memo } from "react"
import { Rnd, DraggableData, ResizableDelta, Position } from "react-rnd";
import { useGetState, useUpdateState } from "../frontend-services";
import { Element_Image, Element_Text } from "../frontend-services/elements";
import { ElementType } from "../frontend-services/schema/element";
import root from 'react-shadow';

const ElementInstance: FC<{ id: string }> = memo(({ id }) => {
  const t = useGetState(state => state.elements[id].type);

  if (t === ElementType.text)
    return  <root.div className="absolute inset-0"><Element_Text id={id} /></root.div>
  if (t === ElementType.image)
    return <Element_Image />

  return <></>
})

const Knob: FC<{ className: string }> = ({ className }) => {
  return <div className={classNames("absolute rounded-full bg-secondary w-2 h-2", className)}></div>
}

const ElementTransform: FC<{ id: string }> = memo(({ id }) => {
  const rect = useGetState(state => state.elements[id].scenes["main"].rect);
  const update = useUpdateState();

  const handleDrag = (e: any, data: DraggableData) => {
    update(state => {
      state.elements[id].scenes["main"].rect.x = Math.round(data.x);
      state.elements[id].scenes["main"].rect.y = Math.round(data.y);
    });
  }
  const handleResize = (e: MouseEvent | TouchEvent, _dir: unknown, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => {
    update(state => {
      state.elements[id].scenes["main"].rect.x = Math.round(position.x);
      state.elements[id].scenes["main"].rect.y = Math.round(position.y);
      state.elements[id].scenes["main"].rect.w = Math.round(elementRef.offsetWidth);
      state.elements[id].scenes["main"].rect.h = Math.round(elementRef.offsetHeight);
    });
  }
  return <Rnd className="group"
    size={{
      width: rect?.w || 100,
      height: rect?.h || 100
    }}
    position={{
      x: rect?.x || 100,
      y: rect?.y || 100,
    }}
    onDragStop={handleDrag}
    onResizeStop={handleResize}
  >
    <ElementInstance id={id} />
    <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-secondary/50 transition-colors"></div>
    <Knob className="group-hover:opacity-100 opacity-0 transition-opacity -bottom-1 -left-1" />
    <Knob className="group-hover:opacity-100 opacity-0 transition-opacity -bottom-1 -right-1" />
    <Knob className="group-hover:opacity-100 opacity-0 transition-opacity -top-1 -right-1" />
    <Knob className="group-hover:opacity-100 opacity-0 transition-opacity -top-1 -left-1" />
  </Rnd>
});
ElementTransform.displayName = "ElementTransform";
ElementTransform.whyDidYouRender = true;

export default ElementTransform;