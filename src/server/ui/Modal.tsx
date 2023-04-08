import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { FC, PropsWithChildren } from "react";
import SimpleBar from "simplebar-react";

const Base = NiceModal.create<PropsWithChildren<{}>>(({ children }) => {
  const modal = useModal();
  const handleClose = () => {
    modal.resolve();
    modal.remove();
  };

  return <div className="fixed inset-0 flex flex-col justify-center items-center z-50">
    <div onClick={handleClose} className="absolute inset-0 bg-black/30" />
    {children}
  </div>;
});

// limit height
const Body: FC<PropsWithChildren<{width?: number | "auto"}>> = ({ children, width = 500 }) => {
  return <div style={{width}} className="flex flex-col relative bg-base-100 max-h-[90vh] shadow-2xl rounded-box">
    {children}
  </div>
}

const Header: FC<PropsWithChildren> = ({ children }) => {
  return <div className="font-bold text-lg p-4 flex items-center relative">{children}</div>
}

// scroll
const Content: FC<PropsWithChildren> = ({ children }) => {
  return <div className="flex flex-col overflow-hidden flex-grow border-t border-base-300">
    <SimpleBar className="h-full">
      {children}
    </SimpleBar>
  </div>
}
export default { Base, Body, Header, Content }
