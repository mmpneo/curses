use std::mem::MaybeUninit;

use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use windows::{
    core::{Interface, HSTRING},
    h,
    Win32::{
        Media::Speech::{IEnumSpObjectTokens, ISpObjectTokenCategory, ISpVoice, SpObjectTokenCategory, SpVoice, SPF_ASYNC, SPF_DEFAULT},
        System::Com::{CoCreateInstance, CoInitialize, CLSCTX_ALL},
    },
};

mod token;

use self::{intf::Intf, token::Token};
mod intf;

pub struct WindowsTTSPlugin {
    intf: Option<Intf<ISpVoice>>,
}

impl Default for WindowsTTSPlugin {
    fn default() -> Self {
        unsafe {
            if Ok(()) != CoInitialize(None) {
                return Self { intf: None };
            };

            match CoCreateInstance(&SpVoice, None, CLSCTX_ALL) {
                Ok(f) => Self { intf: Some(Intf(f)) },
                Err(err) => {
                    println!("{:?}", err);
                    Self { intf: None }
                }
            }
        }
    }
}

#[command]
fn speak(state: State<WindowsTTSPlugin>) {
    unsafe {
        let Some(sp) = &state.intf else {
            return;
        };

        sp.Speak(h!("Wide"), (SPF_DEFAULT.0 | SPF_ASYNC.0) as u32)
            .unwrap();
    }
}

#[command]
fn get_voices(state: State<WindowsTTSPlugin>) {
    let Some(sp) = &state.intf else {
        return;
    };

    let category = Category::new(h!(r"HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices")).unwrap();

    let tokens = category.enum_tokens();
    let b = tokens.unwrap();
    for a in b {
        println!("token");
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("windows_tts")
        .invoke_handler(tauri::generate_handler![speak, get_voices])
        .setup(|app| {
            app.manage(WindowsTTSPlugin::default());
            Ok(())
        })
        .build()
}

pub(crate) struct Tokens {
    pub intf: Intf<IEnumSpObjectTokens>,
}

impl Iterator for Tokens {
    type Item = Token;

    fn next(&mut self) -> Option<Self::Item> {
        unsafe {
            let mut result = MaybeUninit::uninit();
            self.intf.Next(1, result.as_mut_ptr(), None);
            result.assume_init()
        }
        .map(Token::from_sapi)
    }
}

pub(crate) struct Category {
    intf: Intf<ISpObjectTokenCategory>,
}

impl Category {
    pub fn new(id: &HSTRING) -> Result<Self, windows::core::Error> {
        let intf: ISpObjectTokenCategory = unsafe { CoCreateInstance(&SpObjectTokenCategory, None, CLSCTX_ALL) }?;
        unsafe { intf.SetId(id, false) }?;
        Ok(Self { intf: Intf(intf) })
    }

    pub fn enum_tokens(&self) -> Result<Tokens, windows::core::Error> {
        unsafe { self.intf.EnumTokens(None, None) }.map(|intf| Tokens { intf: Intf(intf) })
    }
}
