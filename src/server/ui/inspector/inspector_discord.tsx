import { Discord_State } from "@/server/services/discord/schema";
import { FC } from "react";
import { SiDiscord } from "react-icons/si";
import { useSnapshot } from "valtio";
import Inspector from "./components";
import { InputCheckbox, InputText, InputTextSource } from "./components/input";


const Inspector_Discord: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.discord.data);
  const up = <K extends keyof Discord_State>(key: K, v: Discord_State[K]) => window.ApiServer.patchService("discord", s => s.data[key] = v);
  return <Inspector.Body>
    <Inspector.Header><SiDiscord/> Discord</Inspector.Header>
    <Inspector.Content>
      <Inspector.Description>Post STT results to discord channel</Inspector.Description>
      <InputCheckbox label="Enable" value={pr.postEnable} onChange={e => up("postEnable", e)} />
      <InputCheckbox label="Post only when live streaming" value={pr.postWithTwitchLive} onChange={e => up("postWithTwitchLive", e)} />
      <InputText type="password" label="Channel hook" value={pr.channelHook} onChange={e => up("channelHook", e.target.value)} />
      <InputText label="Bot name" placeholder="Curses" value={pr.channelBotName} onChange={e => up("channelBotName", e.target.value)} />
      <InputText label="Bot avatar" placeholder="Image url" value={pr.channelAvatarUrl} onChange={e => up("channelAvatarUrl", e.target.value)} />
      <InputTextSource label="Post from" value={pr.postSource} onChange={e => up("postSource", e)} />
      <InputCheckbox label="Post from text field" value={pr.postInput} onChange={e => up("postInput", e)} />
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Discord;
