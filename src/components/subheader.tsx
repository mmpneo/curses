import {FC, PropsWithChildren} from "react";

const SubHeader: FC<PropsWithChildren> = ({children}) => {
  return <span className="pt-3 font-semibold text-xs opacity-50">{children}</span>
}

export default SubHeader;
