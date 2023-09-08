import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { FC, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useGetState } from "@/client";
import Modal           from "./Modal";
import { FileState } from "@/client/services/files/schema";
import FileElement   from "./file-element";
import { useTranslation } from "react-i18next";

const FilesModal: FC = () => {
  const {t} = useTranslation();
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
  const handleRemove = (id: string) => { window.ApiClient.files.removeFile(id) };

  const selectActions = useRef([
    { label: t('common.btn_select'), fn: handleSelect }
  ]);
  const fileActions = useRef([
    { label: t('files.btn_copy_reference'), fn: handleCopyStyle },
    { label: t('common.btn_remove'), fn: handleRemove },
  ]);

  useEffect(() => {
    filesMeta && setData(args?.select ? filesMeta.filter(file => file.type.startsWith(args?.select)) : filesMeta)
  }, [filesMeta, args]);

  return <Modal.Body>

    <Modal.Header>
      {t('select_file.title')}
      {!args?.select && <button className=" absolute right-4 top-4 btn btn-accent btn-sm" onClick={() => window.ApiClient.files.addFile()}>{t('files.add_file')}</button>}
    </Modal.Header>
    <Modal.Content>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(file => <FileElement key={file.id} data={file} actions={args?.select ? selectActions.current : fileActions.current} />)}
      </div>
    </Modal.Content>
  </Modal.Body>
}

NiceModal.register('files', (props) => <Modal.Base {...props}><FilesModal /></Modal.Base>);
