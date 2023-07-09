import { FC, memo } from "react";
import root            from 'react-shadow';
import { useGetState } from "../index";
import Element_Image   from "../elements/image";
import Element_Text    from "../elements/text";
import { ElementType } from "../elements/schema";
import { useSnapshot } from "valtio";

export const ElementInstance: FC<{ id: string; }> = memo(({ id }) => {
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const {type, scenes} = useGetState(state => state.elements[id]);
  if (!(activeScene in scenes))
    return <></>
  function render() {
    switch (type) {
      case ElementType.text: return <Element_Text id={id} />;
      case ElementType.image: return <Element_Image id={id} />;
      default: return <>unknown element</>;
    }
  }
  return <root.div className="absolute inset-0">{render()}</root.div>;
});
