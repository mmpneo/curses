use serde::{Deserialize, Serialize};
use std::{
    os::raw::c_int,
    sync::{Arc, Mutex, RwLock},
};
use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use tokio::sync::mpsc;
use windows::Win32::{
    Foundation::{LPARAM, LRESULT, WPARAM},
    System::Threading::{AttachThreadInput, GetCurrentThreadId},
    UI::{
        Input::KeyboardAndMouse::{GetKeyboardLayout, GetKeyboardState, MapVirtualKeyExW, ToUnicodeEx, MAPVK_VK_TO_VSC_EX, VK_LCONTROL},
        WindowsAndMessaging::{
            CallNextHookEx, GetForegroundWindow, GetWindowThreadProcessId, SetWindowsHookExA, UnhookWindowsHookEx, HC_ACTION, HHOOK, KBDLLHOOKSTRUCT,
            WH_KEYBOARD_LL, WM_KEYDOWN,
        },
    },
};

struct BgInput {
    active_shortcuts: Mutex<Vec<HotkeyBinding>>,
    tx: mpsc::UnboundedSender<String>,
    listen_hook_id: RwLock<Option<HHOOK>>,
}

#[derive(Debug)]
enum KeyCommand {
    Escape,
    Return,
    Delete,
    BackSpace,
    Key(String),
}

static mut GLOBAL_CALLBACK: Option<Box<dyn FnMut(KeyCommand)>> = None;

impl BgInput {
    fn rebind_shortcuts(&self, shortcuts: Vec<HotkeyBinding>) {
        // unregister everything
        let mut a = self.active_shortcuts.lock().unwrap();
        for sh in a.iter() {
            // mki::unregister_hotkey(&sh.keys.as_slice());
        }
        *a = shortcuts.clone();

        //save new current
        for sh in shortcuts {
            let tx = self.tx.clone();
            let keys = sh.keys.clone();
            // mki::register_hotkey(&sh.keys.as_slice(), move || {
            //     // release every key, so it won't stuck pressed when listener starts
            //     for k in &keys {
            //         k.release();
            //     }
            //     tx.send(format!("shortcut:{}", sh.name.clone())).unwrap();
            // });
        }
    }
}

unsafe extern "system" fn raw_callback(code: c_int, param: WPARAM, lpdata: LPARAM) -> LRESULT {
    if code as u32 != HC_ACTION {
        return CallNextHookEx(None, code, param, lpdata);
    }

    if let Ok(WM_KEYDOWN) = param.0.try_into() {
        let KBDLLHOOKSTRUCT { vkCode, .. } = *(lpdata.0 as *const KBDLLHOOKSTRUCT);
        let m: Option<KeyCommand> = match vkCode {
            46 => Some(KeyCommand::Delete),
            27 => Some(KeyCommand::Escape),
            8 => Some(KeyCommand::BackSpace),
            13 => Some(KeyCommand::Return),
            _ => {
                let window_thread_id = GetWindowThreadProcessId(GetForegroundWindow(), None);
                let thread_id = GetCurrentThreadId();
                
                let mut kb_state = [0_u8; 256_usize];
                if AttachThreadInput(thread_id, window_thread_id, true).as_bool() {
                    GetKeyboardState(&mut kb_state);
                    AttachThreadInput(thread_id, window_thread_id, false);
                } else {
                    GetKeyboardState(&mut kb_state);
                }
                
                if kb_state[VK_LCONTROL.0 as usize] > 1 {
                    None
                } else {
                    let kb_layout = GetKeyboardLayout(window_thread_id);
                    let code = MapVirtualKeyExW(vkCode, MAPVK_VK_TO_VSC_EX, kb_layout) << 16;
    
                    let mut name = [0_u16; 32];
                    let res_size = ToUnicodeEx(vkCode, code, &kb_state, &mut name, 0, kb_layout);
                    if res_size > 0 {
                        if let Some(s) = String::from_utf16(&name[..res_size as usize]).ok() {
                            Some(KeyCommand::Key(s))
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                }

            }
        };

        if m.is_some() {
            if let Some(cb) = &mut GLOBAL_CALLBACK {
                cb(m.unwrap());
            }
            // block on command
            return LRESULT(1);
        }
    }
    CallNextHookEx(None, code, param, lpdata)
}

#[command]
fn start_tracking(state: State<'_, BgInput>) -> Result<(), String> {
    {
        let current_hook_id = state.listen_hook_id.read().unwrap();
        if current_hook_id.is_some() {
            return Err("Already active".into());
        }
    }
    
    let tx = state.tx.clone();
    unsafe {
        GLOBAL_CALLBACK = Some(Box::new(move |cmd| {
            let rpc: String = match cmd {
                KeyCommand::Escape => "cmd:cancel".to_string(),
                KeyCommand::Return => "cmd:submit".to_string(),
                KeyCommand::Delete | KeyCommand::BackSpace => "cmd:delete".to_string(),
                KeyCommand::Key(key) => format!("key:{}", key),
            };
            tx.send(rpc).unwrap();
        }));
    }
    let Ok(hook) = (unsafe {SetWindowsHookExA(WH_KEYBOARD_LL, Some(raw_callback), None, 0)}) else {
        return Err("Could not start listener".into());
    };
    let mut wr = state.listen_hook_id.write().unwrap();
    *wr = Some(hook);
    Ok(())
}

#[command]
fn stop_tracking(state: State<BgInput>) {
    let mut wr = state.listen_hook_id.write().unwrap();
    if let Some(hook) = *wr {
        unsafe {
            UnhookWindowsHookEx(hook);
        }
    };
    *wr = None;
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct HotkeyBinding {
    name: String,
    keys: Vec<mki::Keyboard>,
}

#[command]
fn apply_shortcuts(shortcuts: Vec<HotkeyBinding>, state: State<BgInput>) -> Result<(), String> {
    println!("{:?}", shortcuts);
    state.rebind_shortcuts(shortcuts);
    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    let (pubsub_output_tx, mut pubsub_output_rx) = mpsc::unbounded_channel::<String>(); // to js
    Builder::new("keyboard")
        .invoke_handler(tauri::generate_handler![start_tracking, stop_tracking, apply_shortcuts])
        .setup(|app| {
            app.manage(BgInput {
                tx: pubsub_output_tx,
                active_shortcuts: Mutex::default(),
                listen_hook_id: RwLock::new(None),
            });
            let handle = app.app_handle();
            tauri::async_runtime::spawn(async move {
                loop {
                    if let Some(output) = pubsub_output_rx.recv().await {
                        handle.emit_all("keyboard", output).unwrap();
                    }
                }
            });
            Ok(())
        })
        .build()
}
