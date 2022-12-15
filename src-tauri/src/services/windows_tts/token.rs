use windows::{
    core::HSTRING,
    Win32::{
        Media::Speech::{ISpObjectToken, SpObjectToken},
        System::Com::{CoCreateInstance, CLSCTX_ALL},
    },
};

use super::intf::Intf;

pub(crate) struct Token {
    intf: Intf<ISpObjectToken>,
}
impl Token {
    pub fn new(id: &HSTRING) -> Result<Self, windows::core::Error> {
        let intf: ISpObjectToken = unsafe { CoCreateInstance(&SpObjectToken, None, CLSCTX_ALL) }?;
        unsafe { intf.SetId(None, id, false) }?;
        Ok(Token { intf: Intf(intf) })
    }

    pub fn from_sapi(intf: ISpObjectToken) -> Self {
        Token { intf: Intf(intf) }
    }
}
