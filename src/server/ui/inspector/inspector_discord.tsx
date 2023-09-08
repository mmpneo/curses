import { Discord_State } from "@/server/services/discord/schema";
import { FC } from "react";
import { SiDiscord } from "react-icons/si";
import { useSnapshot } from "valtio";
import Inspector from "./components";
import { InputCheckbox, InputText, InputTextSource } from "./components/input";
import { useTranslation } from "react-i18next";


const Inspector_Discord: FC = () => {
  const {t} = useTranslation();
  const pr = useSnapshot(window.ApiServer.state.services.discord.data);
  const up = <K extends keyof Discord_State>(key: K, v: Discord_State[K]) => window.ApiServer.patchService("discord", s => s.data[key] = v);
  return <Inspector.Body>
    <Inspector.Header><SiDiscord/> {t('discord.title')}</Inspector.Header>
    <Inspector.Content>
      <Inspector.Description>{t('discord.desc')}</Inspector.Description>
      <InputCheckbox label="common.field_enable" value={pr.postEnable} onChange={e => up("postEnable", e)} />
      <InputCheckbox label="discord.field_post_only_when_streaming" value={pr.postWithTwitchLive} onChange={e => up("postWithTwitchLive", e)} />
      <InputText type="password" label="discord.field_channel_hook" value={pr.channelHook} onChange={e => up("channelHook", e.target.value)} />
      <InputText label="discord.field_bot_name" placeholder="Curses" value={pr.channelBotName} onChange={e => up("channelBotName", e.target.value)} />
      <InputText label="discord.field_bot_avatar" placeholder="Image url" value={pr.channelAvatarUrl} onChange={e => up("channelAvatarUrl", e.target.value)} />
      <InputTextSource label="common.field_text_source" value={pr.postSource} onChange={e => up("postSource", e)} />
      <InputCheckbox label="common.field_use_keyboard_input" value={pr.postInput} onChange={e => up("postInput", e)} />
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Discord;
