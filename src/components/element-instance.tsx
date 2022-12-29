import { FC, memo } from "react";
import root from 'react-shadow';
import { useGetState } from "../frontend-services";
import Element_Image from "../frontend-services/elements/image";
import Element_Text from "../frontend-services/elements/text";
import { ElementType } from "../frontend-services/schema/element";

export const ElementInstance: FC<{ id: string; }> = memo(({ id }) => {
  const t = useGetState(state => state.elements[id].type);

  function render() {
    switch (t) {
      case ElementType.text: return <Element_Text id={id} />;
      case ElementType.image: return <Element_Image id={id} />;
      default: return <>unknow element</>;
    }
  }
  return <root.div className="absolute inset-0">{render()}</root.div>;
});
