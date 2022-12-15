import { FC, useEffect, useRef, useState } from "react";
import { RiTwitchFill } from "react-icons/ri";
import { toast } from "react-toastify";
import { useGetState } from "..";
import Inspector from "../../components/inspector";
import FileElement from "../components/file-element";
import { FileState } from "./schema";

const Inspector_Files: FC = () => {

  const filesMeta       = useGetState(store => store.filesMeta || []);
  const [data, setData] = useState<FileState[]>([])

  useEffect(() => {
    setData(filesMeta);
  }, [filesMeta]);

  const handleSelect = (id: string) => {
    // modal.resolve(id);
    // modal.remove();
  }

  const handleCopyStyle = (id: string) => {
    navigator.clipboard.writeText(`[file-${id}]`)
    toast.success("Copied style");
  };
  const handleRemove = (id: string) => {window.APIFrontend.files.removeFile(id)};

  const selectActions = useRef([
    {label: 'Select', fn: handleSelect}
  ]);
  const fileActions   = useRef([
    {label: 'Copy reference', fn: handleCopyStyle},
    {label: 'Delete', fn: handleRemove},
  ]);

  

  return <Inspector.Body>
    <Inspector.Header><RiTwitchFill /> Files</Inspector.Header>
    <Inspector.Content>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {data.map(file => <FileElement key={file.id} data={file} actions={fileActions.current}/>)}
      </div>

      <button onClick={() => window.APIFrontend.files.addFile()} className="btn btn-sm btn-ghost">Add file</button>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Files;
