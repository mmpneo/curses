import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { FC, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import SimpleBar from "simplebar-react";
import { useGetState } from "../frontend-services";
import Modal from "./Modal";
import { FileState } from "../frontend-services/files/schema";
import FileElement from "../frontend-services/components/file-element";

const FilesModal: FC = () => {
  const modal = useModal();
  const args = modal.args as { select: string };
  const filesMeta       = useGetState(store => store.filesMeta || []);
  const [data, setData] = useState<FileState[]>([])

  const handleSelect = (id: string) => {
    modal.resolve(id);
    modal.remove();
  }

  const handleCopyStyle = (id: string) => {
    navigator.clipboard.writeText(`[file-${id}]`)
    toast.success("Copied style");
  };
  const handleRemove = (id: string) => { window.APIFrontend.files.removeFile(id) };

  const selectActions = useRef([
    { label: 'Select', fn: handleSelect }
  ]);
  const fileActions = useRef([
    { label: 'Copy reference', fn: handleCopyStyle },
    { label: 'Delete', fn: handleRemove },
  ]);

  useEffect(() => {
    filesMeta && setData(args?.select ? filesMeta.filter(file => file.type.startsWith(args?.select)) : filesMeta)
  }, [filesMeta, args]);

  return <Modal.Body>

    <Modal.Header>
      {args?.select ? "Select file" : "Files"}
      {!args?.select && <button className=" absolute right-4 top-4 btn btn-accent btn-sm" onClick={() => window.APIFrontend.files.addFile()}>Add file</button>}
    </Modal.Header>
    <Modal.Content>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(file => <FileElement key={file.id} data={file} actions={args?.select ? selectActions.current : fileActions.current} />)}
      </div>
    </Modal.Content>

  </Modal.Body>
}

NiceModal.register('files', (props) => <Modal.Base {...props}><FilesModal /></Modal.Base>);
