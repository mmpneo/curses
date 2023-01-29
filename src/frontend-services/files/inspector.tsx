import groupBy from "lodash/groupBy";
import { FC, memo, useEffect, useRef, useState } from "react";
import { RiAddFill, RiTwitchFill } from "react-icons/ri";
import { toast } from "react-toastify";
import { useGetState } from "..";
import Dropdown from "../../components/dropdown/Dropdown";
import Inspector from "../../components/inspector";
import FileElement, { FontGroup, FontGroupProps } from "../components/file-element";
import { FileState } from "./schema";

const AddFileMenu: FC = () => {
  return <ul className="dropdown p-2">
    <li className="menu-title"><span>Add file</span></li>
    <li><button onClick={() => window.APIFrontend.files.addFile("image")}>Image</button></li>
    <li><button onClick={() => window.APIFrontend.files.addFile("audio")}>Sound</button></li>
    <li><button onClick={() => window.APIFrontend.files.addFile("font")}>Font</button></li>
    {/*todo later <li><button onClick={() => window.APIFrontend.files.addFile("video")}>Image</button></li> */}
  </ul>;
}

const Inspector_Files: FC = memo(() => {
  const [fonts, setFonts] = useState<FontGroupProps[]>([]);
  const filesMeta = useGetState(store => store.filesMeta || []);
  const [data, setData] = useState<FileState[]>([])

  useEffect(() => {
    setData(filesMeta.filter(meta => !meta.type.startsWith("font/")));
    const grouppedFonts = groupBy(filesMeta.filter(meta => meta.type.startsWith("font/")), "name");
    const fontGroups: FontGroupProps[] = Object.keys(grouppedFonts)
      .map(name => grouppedFonts[name].reduce((sum, font) => ({
        name, count: sum.count + 1, size: sum.size + font.size
      }), { name, count: 0, size: 0 }))
    setFonts(fontGroups);
  }, [filesMeta]);

  const handleCopyStyle = (id: string) => {
    navigator.clipboard.writeText(`[file-${id}]`)
    toast.success("Copied style");
  };
  const handleRemove = (id: string) => { window.APIFrontend.files.removeFile(id) };

  const fileActions = useRef([
    { label: 'Copy reference', fn: handleCopyStyle },
    { label: 'Delete', fn: handleRemove },
  ]);

  return <Inspector.Body>
    <Inspector.Header><RiTwitchFill />
      <div className="w-full flex justify-between">
        Files
        <Dropdown targetOffset={24} placement="right" content={<AddFileMenu />}>
          <button className="flex-grow btn btn-circle btn-sm">
            <RiAddFill />
          </button>
        </Dropdown>
      </div>
    </Inspector.Header>
    <Inspector.Content>
      <div className="flex flex-col space-y-2">
        {fonts.map(font => <FontGroup key={font.name} data={font}></FontGroup>)}
        {data.map(file => <FileElement key={file.id} data={file} actions={fileActions.current} />)}
      </div>
    </Inspector.Content>
  </Inspector.Body >
})

export default Inspector_Files;
