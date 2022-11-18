import { FC, useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import Input from "../../components/input";
import { ServiceLanguageLibrary } from "./service_data";

function getDialectList(list: ServiceLanguageLibrary, langGroup: string) {
  const langIndex = list.findIndex(l => l[0] === langGroup);
  if (langIndex < 0)
    return [];
  const l = [...list[langIndex]]
  l.shift();
  return l;
}

const ServiceLanguageSelect: FC<{ library: ServiceLanguageLibrary }> = ({ library }) => {
  const [dialectList, setDialectList] = useState<[string, string][]>([]);

  const state = useSnapshot(window.API.state.services.stt.data);

  useEffect(() => {
    const l = getDialectList(library, window.API.state.services.stt.data.lang_group);
    (l.length > 1) && setDialectList(l as [string, string][]);
  }, []);

  const handleSelectLang = (langGroup: string) => {
    const l = getDialectList(library, langGroup);
    window.API.state.services.stt.data.lang_group = langGroup;
    window.API.state.services.stt.data.lang_name = l[0][0];
    setDialectList(l as [string, string][]);
  }

  const handleSelectDialect = (langName: string) => {
    window.API.state.services.stt.data.lang_name = langName;
  };

  return <>
    <Input.Select label="Language" value={state.lang_group} onChange={e => handleSelectLang(e.target.value)}>
      {library.map((lang, i) => <option key={i} value={lang[0]}>{lang[0]}</option>)}
    </Input.Select>
    {dialectList.length > 1 && <Input.Select label="Dialect" value={state.lang_name} onChange={e => handleSelectDialect(e.target.value)}>
      {dialectList?.map((d, i) => <option key={i} value={d[0]}>{d[1]}</option>)}
    </Input.Select>}
  </>
}

export default ServiceLanguageSelect;