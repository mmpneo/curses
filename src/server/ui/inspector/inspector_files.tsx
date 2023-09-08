import groupBy from "lodash/groupBy";
import { FC, memo, useEffect, useRef, useState } from "react";
import { RiAddFill, RiImage2Fill } from "react-icons/ri";
import { toast }                                  from "react-toastify";
import { useGetState }                            from "@/client";
import Dropdown                                   from "../dropdown/Dropdown";
import Inspector                                  from "./components";
import FileElement, { FontGroup, FontGroupProps } from "@/server/ui/file-element";
import { FileState }                              from "@/client/services/files/schema";
import { useTranslation } from "react-i18next";

const AddFileMenu: FC = () => {
  const {t} = useTranslation();
  return <ul className="dropdown p-2">
    <li className="menu-title"><span>{t('files.add_file')}</span></li>
    <li><button onClick={() => window.ApiClient.files.addFile("image")}>{t('files.type_image')}</button></li>
    <li><button onClick={() => window.ApiClient.files.addFile("audio")}>{t('files.type_sound')}</button></li>
    <li><button onClick={() => window.ApiClient.files.addFile("font")}>{t('files.type_font')}</button></li>
  </ul>;
}

const Inspector_Files: FC = memo(() => {
  const {t} = useTranslation();
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
  const handleRemove = (id: string) => { window.ApiClient.files.removeFile(id) };

  const fileActions = useRef([
    { label: t('files.btn_copy_reference'), fn: handleCopyStyle },
    { label: t('common.btn_remove'), fn: handleRemove },
  ]);

  return <Inspector.Body>
    <Inspector.Header>
      <RiImage2Fill />
      <div className="w-full flex justify-between">
        {t('files.title')}
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
