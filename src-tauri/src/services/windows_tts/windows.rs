use serde::{Deserialize, Serialize};

use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use windows::Win32::Media::Speech::{
    ISpeechObjectToken, ISpeechObjectTokens, ISpeechVoice, SVSFDefault, SVSFlagsAsync, SpVoice, SpeechVoiceSpeakFlags,
};

use windows::core::Interface;
use windows::core::BSTR;

#[derive(Debug)]
pub struct Intf<I: Interface>(pub I);

unsafe impl<I: Interface> Send for Intf<I> {}
unsafe impl<I: Interface> Sync for Intf<I> {}

impl<I: Interface> std::ops::Deref for Intf<I> {
    type Target = I;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<I: Interface> std::ops::DerefMut for Intf<I> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

#[derive(Default)]
pub struct WindowsTTSPlugin(Option<Intf<ISpeechVoice>>);

#[derive(Serialize, Deserialize, Debug)]
struct SpeechObject {
    pub id: String,
    pub label: String,
}

#[derive(Debug)]
struct ISpeechToken {
    id: String,
    pub t: Intf<ISpeechObjectToken>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcWindowsTTSConfig {
    devices: Vec<SpeechObject>,
    voices: Vec<SpeechObject>,
}

impl ISpeechToken {
    fn get_desc(&self) -> Option<SpeechObject> {
        let id = unsafe { self.t.0.Id() };
        id.ok().and_then(|id| {
            let label = unsafe { self.t.0.GetDescription(0) }.ok()?;
            Some(SpeechObject {
                id: id.to_string(),
                label: label.to_string(),
            })
        })
    }
}

impl WindowsTTSPlugin {
    fn new() -> Self {
        use windows::Win32::System::Com::{CoCreateInstance, CoInitialize, CLSCTX_ALL};
        let voice = unsafe { CoInitialize(None).and_then(|| CoCreateInstance(&SpVoice, None, CLSCTX_ALL)) };
        Self(voice.map(Intf).ok())
    }

    fn list_devices(&self) -> Option<Vec<ISpeechToken>> {
        self.0
            .as_ref()
            .and_then(|sp| unsafe { sp.GetAudioOutputs(&BSTR::new(), &BSTR::new()) }.ok())
            .and_then(into_speech_tokens)
    }

    fn list_voices(&self) -> Option<Vec<ISpeechToken>> {
        self.0
            .as_ref()
            .and_then(|sp| unsafe { sp.GetVoices(&BSTR::new(), &BSTR::new()) }.ok())
            .and_then(into_speech_tokens)
    }
}

fn into_speech_tokens(tokens: ISpeechObjectTokens) -> Option<Vec<ISpeechToken>> {
    let count = unsafe { tokens.Count() }.ok()?;
    let tokens = (0..count)
        .into_iter()
        .map(|i| {
            unsafe { tokens.Item(i) }.ok().and_then(|token| {
                let id = unsafe { token.Id() }.ok()?;
                Some(ISpeechToken {
                    id: id.to_string(),
                    t: Intf(token),
                })
            })
        })
        .flatten()
        .collect();

    Some(tokens)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcWindowsTTSSpeak {
    device: String,
    voice: String,
    value: String,
    volume: f32, // 0 - 1
    rate: f32,   // 0 - 1 - 5
}

#[tauri::command]
fn get_voices(state: State<WindowsTTSPlugin>) -> Result<RpcWindowsTTSConfig, &str> {
    let devices = state
        .list_devices()
        .map(|list| list.iter().flat_map(ISpeechToken::get_desc).collect())
        .ok_or("Failed to get device list")?;

    let voices = state
        .list_voices()
        .map(|list| list.iter().flat_map(ISpeechToken::get_desc).collect())
        .ok_or("Failed to get voice list")?;

    Ok(RpcWindowsTTSConfig { voices, devices })
}

#[tauri::command]
fn speak(data: RpcWindowsTTSSpeak, state: State<WindowsTTSPlugin>) -> Result<(), &str> {
    if data.value.is_empty() {
        return Ok(());
    }

    let voice = state.0.as_ref().ok_or("Plugin is not initialized")?;
    let volume = (data.volume * 100.0) as i32;

    if unsafe { voice.0.SetVolume(volume) }.is_err() {
        return Err("Unable to update volume");
    }

    // convert multiply based [0 - 1 - 5] to range [-10 - 10]
    let rate = if data.rate >= 1.0 {
        ((data.rate - 1.0) / 4.0 * 10.0) as i32
    } else {
        (-data.rate * 100.0) as i32
    };

    if unsafe { voice.0.SetRate(rate) }.is_err() {
        return Err("Unable to update rate");
    }

    state
        .list_devices()
        .as_deref()
        .and_then(|list| list.iter().find(|t| t.id == data.device))
        .and_then(|token| unsafe { voice.0.putref_AudioOutput(&token.t.0).ok() })
        .ok_or("Failed to apply device")?;

    state
        .list_voices()
        .as_deref()
        .and_then(|list| list.iter().find(|t| t.id == data.voice))
        .and_then(|token| unsafe { voice.0.putref_Voice(&token.t.0).ok() })
        .ok_or("Failed to apply voice")?;

    let flags = SpeechVoiceSpeakFlags(SVSFDefault.0 | SVSFlagsAsync.0);
    if unsafe { voice.Speak(&data.value.into(), flags) }.is_err() {
        return Err("Unable to process text");
    }

    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("windows_tts")
        .invoke_handler(tauri::generate_handler![speak, get_voices])
        .setup(|app| {
            app.manage(WindowsTTSPlugin::new());
            Ok(())
        })
        .build()
}
