use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex, RwLock};
use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use tokio::sync::mpsc;

struct BgInput {
    active_shortcuts: Mutex<Vec<HotkeyBinding>>,
    tx: mpsc::UnboundedSender<String>,
    listen_keys: Arc<RwLock<bool>>,
}

impl BgInput {
    fn rebind_shortcuts(&self, shortcuts: Vec<HotkeyBinding>) {
        // unregister everything
        let mut a = self.active_shortcuts.lock().unwrap();
        for sh in a.iter() {
            mki::unregister_hotkey(&sh.keys.as_slice());
        }
        *a = shortcuts.clone();

        //save new current
        for sh in shortcuts {
            let tx = self.tx.clone();
            mki::register_hotkey(&sh.keys.as_slice(), move || {
                tx.send(format!("shortcut:{}", sh.name.clone())).unwrap();
            });
        }
    }
}

#[command]
fn start_tracking(state: State<BgInput>) {
    let mut wr = state.listen_keys.write().unwrap();
    *wr = true;
}

#[command]
fn stop_tracking(state: State<BgInput>) {
    let mut wr = state.listen_keys.write().unwrap();
    *wr = false;
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

    let tx = pubsub_output_tx.clone();
    Builder::new("keyboard")
        .invoke_handler(tauri::generate_handler![start_tracking, stop_tracking, apply_shortcuts])
        .setup(|app| {
            let arc_rw_listen = Arc::new(RwLock::new(false));
            let rw_listen = arc_rw_listen.clone();
            let rw_listen2 = arc_rw_listen.clone();

            app.manage(BgInput {
                tx: pubsub_output_tx,
                active_shortcuts: Mutex::default(),
                listen_keys: rw_listen,
            });
            // listen for input
            std::thread::spawn(move || {
                rdev::listen(move |e| {
                    let listen_keys = rw_listen2.read().unwrap();
                    if !*listen_keys {
                        return;
                    }
                    if let rdev::EventType::KeyPress(_) = e.event_type {
                        if let Some(key) = e.name {
                            tx.send(format!("key:{}", key)).unwrap();
                        }
                    }
                })
                .unwrap();
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
