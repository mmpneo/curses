<p align="center">
<img height="60" src="https://user-images.githubusercontent.com/3977499/218317016-0ebd9936-4065-4b6b-a0a0-1199d43c0024.svg">
</p>
<p align="center">
  <a href="https://GitHub.com/mmpneo/curses/releases/"><img src="https://img.shields.io/github/release/mmpneo/curses.svg?color=FC6471&label" alt="Node.js CI"></a>
</p>
<p align="center">Speech to Text Captions for OBS, VRChat, Twitch chat and Discord</p>

<p align="center"><b>Socials</b></p>
<p align="center">
  <a href="https://www.twitch.tv/mmpcode"><img alt="Twitch Status" src="https://img.shields.io/twitch/status/mmpcode?label=Dev Streams&logo=twitch&logoColor=white"></a>
  <a href="https://discord.gg/Sw6pw8fGYS"><img src="https://img.shields.io/discord/856500849815060500?label=Join Discord&color=blue&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://twitter.com/mmpneo"><img src="https://img.shields.io/badge/Receive Updates-%231DA1F2.svg?label=Follow&logo=twitter&logoColor=white"></a> 
</p>

<p align="center">
<span class="badge-patreon">
  <a href="https://patreon.com/mmpcode"><img src="https://img.shields.io/badge/patreon-Donate-yellow.svg?label=&logo=patreon&logoColor=white" alt="Patreon donate button" /></a>
</span>
</p>

<p align="center">
<!-- static -->
  <!-- <img width="600" src="https://user-images.githubusercontent.com/3977499/218319590-296c96f0-7daa-4130-ab40-6b32f20cc26e.png"> -->
  <img width="600" src="https://user-images.githubusercontent.com/3977499/218335391-a53dab5b-1e22-47b8-89c5-e1124798fbdc.gif">
</p>

<p align="center"><b>Repo Stats</b></p>
<p align="center">
  <img alt="GitHub repo size]" src="https://img.shields.io/github/repo-size/mmpneo/curses?color=2EB87D"/>
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/mmpneo/curses?color=2EB87D"/>
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/mmpneo/curses?color=2EB87D"/>
  <img alt="GitHub last commit]" src="https://img.shields.io/github/last-commit/mmpneo/curses?color=2EB87D"/>
</p>

# Features
- **OBS Captions customization**: Colors, fonts, shadows, background textures, text typing animation, sound effects, particle effects and CSS
- **Native OBS stream captions**
- **Google Fonts**: more than 1000 free fonts for OBS captions
- **Speech to Text**: [Microsoft Azure](https://azure.microsoft.com/en-au/products/cognitive-services/speech-to-text/), [Speechly](https://www.speechly.com/), [Deepgram](https://deepgram.com/), WebSpeechApi(Chrome and Edge)
- **Text to Speech**: [Microsoft Azure](https://azure.microsoft.com/en-us/products/cognitive-services/text-to-speech/), [Uberduck](https://uberduck.ai/), TikTok, Windows Api (SAPI), WebSpeechApi
- **VRChat**: [KillFrenzy Avatar text](https://github.com/killfrenzy96/KillFrenzyAvatarText), vrchat's chatbox
- **Twitch**: 
  - Use 7TV/FFZ/BTTV emotes in OBS captions
  - Post your STT to chat 
  - Post to another streamer's chat: add channels to your list and pick a target from a dropdown. Your own channel is always the default on startup, and posting to another channel only works while that channel is live
  - Use your chat messages as a source for captions and TTS
  - native captions
- **Discord**: Send your STT to specified channel
- **Scenes**:
  - Save multiple designs and freely switch between them
  - Automatically switch design when OBS changes scene

# Community
For help, feature requests, bug reports, release notifications, design templates [Join Discord](https://discord.gg/Sw6pw8fGYS)

<a href="https://discord.gg/Sw6pw8fGYS"><img src="https://discordapp.com/api/guilds/856500849815060500/widget.png?style=banner2" /></a>

# Getting Started with OBS
### 1. Get the App
Get the latest [release here](https://github.com/mmpneo/curses/releases/latest). You can also [Join Discord](https://discord.gg/Sw6pw8fGYS) to get release notifications and download the new version from there as soon as it is published

### 2. Open app and copy link for OBS
Or click "Set Up OBS" to have everything set up automatically with **obs-websocket** plugin

<img width="600" src="https://user-images.githubusercontent.com/3977499/218330675-472e02a9-1e18-4d60-8662-c4ca33325c24.gif">

### 3. Create browser source in OBS
Paste the link and change window size to match app's canvas size (default is 500x300)

<img width="600" src="https://user-images.githubusercontent.com/3977499/218331723-721b69c5-a457-4dad-9658-f5232afc68f1.gif">

# Building from Source (Windows)

### Requirements
- [Node.js](https://nodejs.org) 18 or newer
- [pnpm](https://pnpm.io) 10 or newer (`npm install -g pnpm`)
- [Rust toolchain](https://rustup.rs) (stable). The WiX and NSIS installer tooling is downloaded automatically by Tauri on the first build
- Optional: a Twitch application client id — without it the app builds and runs fine, but the Twitch login fails with `{"status":400,"message":"invalid client"}`. See the next section

> **Note**: dependency install scripts (`esbuild`, `@swc/core`, etc.) are pre-approved in [pnpm-workspace.yaml](pnpm-workspace.yaml), so no `pnpm approve-builds` step is needed.

### Twitch client id
The official releases have a client id baked in at build time from a CI secret, so local builds need their own. Getting one is free:

1. Open the [Twitch developer console](https://dev.twitch.tv/console/apps) (any Twitch account works) and click **Register Your Application**
2. Fill in the form:
   - **Name** — anything, e.g. `curses-local`
   - **OAuth Redirect URLs** — add **both** of these, so packaged builds and `pnpm tauri dev` each work:
     - `http://localhost:3030/oauth_twitch.html` (must match `CURSES_TWITCH_CLIENT_REDIRECT_LOCAL` in [.env](.env))
     - `http://localhost:1420/oauth_twitch.html`
   - **Category** — anything, e.g. Application Integration
   - **Client Type** — **Public**. This is required: the app uses the OAuth implicit grant flow, which Twitch only allows for public clients. A confidential client will keep failing with "invalid client" even when the id is correct
3. Click **Manage** on the new application and copy its **Client ID** (the client secret is not needed)
4. Create a file named `.env.local` in the repository root containing:

   ```
   CURSES_TWITCH_CLIENT_ID=<your-client-id>
   ```

   `.env.local` is gitignored, and both the build script and the dev server pick it up automatically. Alternatively, pass the id directly with `.\build.ps1 -TwitchClientId <your-client-id>`

The client id is compiled into the app at build time, not read when the app starts — after adding or changing it, rebuild (and reinstall if you use the installer) for it to take effect.

### Build and package
Run the build script from the repository root:

```powershell
.\build.ps1
```

| Option | Effect |
|---|---|
| `-TwitchClientId <id>` | Bake a Twitch client id into the build. Can also be set via the `CURSES_TWITCH_CLIENT_ID` environment variable or a line in `.env.local` |
| `-Clean` | Delete previous frontend, bundle and packaging output first |
| `-SkipInstall` | Skip `pnpm install` when dependencies are already up to date |

The script typechecks and builds the frontend, compiles the Tauri app in release mode, and collects everything into `build-output\`:
- `curses.exe` — standalone binary
- `curses_<version>_x64_portable.zip` — zipped standalone binary
- `curses_<version>_x64_en-US.msi` — WiX installer
- `curses_<version>_x64-setup.exe` — NSIS installer

### Development
```powershell
pnpm install
pnpm tauri dev
```

## Roadmap
- [ ] STT - Vosk
- [ ] STT - OpenAI Whisper
- [ ] TTS - VoiceVox