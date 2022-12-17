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
    console.log(langGroup, l)
    onChangeLang(langGroup);
    onChangeVoice(l[0][1]);
  }
  
  const handleSelectVoice = (langName: string) => {
    onChangeVoice(langName);
  };

  const lang = library.find(l => l[1] === value.language);
  const langOption = lang ? {label: lang?.[0], value: lang?.[1]} : null;

  const voice = lang?.[2].find(l => l[1] === value.voice);
  const voiceOption = lang ? {label: voice?.[0], value: voice?.[1]} : null;

  return <>
    <Input.Select
      options={library.map((lang, i) => ({ label: lang[0], value: lang[1] }))}
      label="Language"
      value={langOption}
      onChange={(e: any) => handleSelectLang(e.value)} />
    {<Input.Select
      options={voiceList.map((lang, i) => ({ label: lang[0], value: lang[1] }))}
      label="Voice"
      value={voiceOption}
      onChange={(e: any) => handleSelectVoice(e.value)} />}
  </>
}

export default ServiceVoiceSelect;