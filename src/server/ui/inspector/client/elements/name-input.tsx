import { FC }                          from "react";
import { useGetState, useUpdateState } from "@/client";

const NameInput: FC<{id: string}> = ({id}) => {
  const name = useGetState(state => state.elements[id].name);
  const update = useUpdateState();

  const handleUpdateName = (v: string) => update(state => {
    state.elements[id].name = v;
  });

  return <>
    <input value={name} onChange={e => handleUpdateName(e.target.value)} className="w-full appearance-none text-xl font-bold border-none !outline-none bg-transparent" />
  </>
}

export default NameInput
