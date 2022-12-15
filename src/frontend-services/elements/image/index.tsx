import { data } from "autoprefixer";
import classNames from "classnames";
import { FC, memo, useEffect, useRef, useState } from "react";
import { useDebounce, useEffectOnce } from "react-use";
import { useGetState } from "../..";
import { StyleToEventController } from "../utils";
import Inspector_ElementImage from "./inspector";
import { Element_ImageState, Element_ImageStateSchema } from "./schema";

const Element_Image: FC<{ id: string }> = memo(({ id }) => {
  const state: Element_ImageState = useGetState(state => state.elements[id].scenes["main"].data);
  const attributeController = useRef<StyleToEventController>();

  const [attributes, setAttributes] = useState<Record<string, string>>({})

  useEffectOnce(() => {
    attributeController.current = new StyleToEventController(state.styleCss, attrs => {
      setAttributes(Object.fromEntries(attrs.map(a => [a.toLowerCase(), ""])));
    });
  });

  const [active, setActive] = useState(false);


  const [, cancel] = useDebounce(
    () => {setActive(false);},
    state.activeDuration,
    [active]
  );

  useEffect(() => {
    const hasEvent = !!state.activeEvent;
    if (hasEvent) {
      const sub = window.API.pubsub.subscribe(state.activeEvent, _ => {
        setActive(true);
      });
      return () => window.API.pubsub.unsubscribe(sub);
    }
  }, [state.activeEvent]);

  useEffect(() => {
    attributeController.current?.OnStyleChange(state.styleCss)
  }, [state.styleCss]);

  return <>
    <style>
      {`
      .image {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        outline: 1px solid transparent;
        margin: auto;
        object-fit: contain;
        opacity: ${state.styleOpacity};
        background-image: url("${window.APIFrontend.files.getFileUrl(state.fileId)}");
        transition: opacity ${state.activeTransitionDuration}ms ease-in-out, background-image ${state.activeTransitionDuration}ms ease-in-out;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
      .image.active{
        opacity: ${state.activeStyleOpacity};
        background-image: url("${window.APIFrontend.files.getFileUrl(state.activeFileId)}");
      }
      `}
    </style>
    <style>{state.styleCss}</style>
    <div {...attributes} className={classNames("image", {active})} />
  </>
});

export { Inspector_ElementImage, Element_ImageStateSchema }
export default Element_Image;