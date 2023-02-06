import classNames from "classnames";
import { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import { useEffectOnce } from "react-use";
import { useGetState } from "../..";
import { StyleToEventController } from "../utils";
import { Element_ImageState } from "./schema";

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

  const timeoutN = useRef(-1 as any);
  const debounce = useCallback(() => {
    setActive(true);
    clearTimeout(timeoutN.current);
    timeoutN.current = setTimeout(() => setActive(false), state.activeDuration);
  }, [state.activeDuration])

  useEffect(() => {
    const hasEvent = !!state.activeEvent;
    if (hasEvent) {
      const sub = window.ApiShared.pubsub.subscribe(state.activeEvent, _ => debounce());
      return () => window.ApiShared.pubsub.unsubscribe(sub);
    }
  }, [state.activeEvent, state.activeDuration]);

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
        background-image: url("${window.ApiClient.files.getFileUrl(state.fileId)}");
        transition: opacity ${state.activeTransitionDuration}ms ease-in-out, background-image ${state.activeTransitionDuration}ms ease-in-out;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
      .image.active{
        opacity: ${state.activeStyleOpacity};
        background-image: url("${window.ApiClient.files.getFileUrl(state.activeFileId)}");
      }
      `}
    </style>
    <style>{state.styleCss}</style>
    <div {...attributes} className={classNames("image", {active})} />
  </>
});

export default Element_Image;
