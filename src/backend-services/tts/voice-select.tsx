import { FC, useEffect, useState } from "react";
import Input from "../../components/input";
import { TTS_State } from "./schema";
import { ServiceVoiceLibrary } from "./service_data";

function getDialectList(list: ServiceVoiceLibrary, langGroup: string) {
  const langIndex = list.findIndex(l => l[1] === langGroup);
  if (langIndex < 0)
    return [];
  const l = [...list[langIndex][2]]
  l.shift();
  return l;
}

const ServiceVoiceSelect: FC<{value: Readonly<TTS_State["azure"]>, onChangeVoice: (v: string) => void, onChangeLang: (v: string) => void, library: ServiceVoiceLibrary }> = ({ value, onChangeLang, onChangeVoice, library }) => {
  const [voiceList, setDialectList] = useState<[string, string][]>([]);

  useEffect(() => {
    const l = getDialectList(library, value.language);
    (l.length > 1) && setDialectList(l as [string, string][]);
  }, []);

  const handleSelectLang = (langGroup: string) => {
    const l = getDialectList(library, langGroup);
    setDialectList(l as [string, string][]);
    onChangeLang(langGroup);
  }
  
  const handleSelectVoice = (langName: string) => {
    onChangeVoice(langName);
  };

  return <>
    <Input.Select
      options={library.map((lang, i) => ({ label: lang[0], value: lang[1] }))}
      label="Language"
      value={{ value: value.language, label: value.language }}
      onChange={(e: any) => handleSelectLang(e.value)} />
    {voiceList.length > 1 && <Input.Select
      options={voiceList.map((lang, i) => ({ label: lang[1], value: lang[0] }))}
      label="Voice"
      value={{ value: value.voice, label: value.voice }}
      onChange={(e: any) => handleSelectVoice(e.value)} />}
  </>
}

export default ServiceVoiceSelect;