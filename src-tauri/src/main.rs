#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clap::Parser;
use serde::{Deserialize, Serialize};
use tauri::{command, Manager, State};
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

use crate::services::AppConfiguration;

mod services;
mod utils;

#[derive(Parser, Debug)]
struct InitArguments {
    #[arg(short, long, default_value_t = 3030)]
    port: u16,
}

#[derive(Serialize, Deserialize)]
struct NativeFeatures {
    background_input: bool,
}

#[command]
fn get_native_features() -> NativeFeatures {
    NativeFeatures {
        background_input: cfg!(feature = "background_input"),
    }
}

#[command]
fn get_port(state: State<'_, InitArguments>) -> u16 {
    state.port
}

#[command]
fn app_close(app_handle: tauri::AppHandle) {
    let Some(window) = app_handle.get_window("main") else {
        return app_handle.exit(0);
    };
    app_handle.save_window_state(StateFlags::all()).ok(); // don't really care if it saves it

    if let Err(_) = window.close() {
        return app_handle.exit(0);
    }
}
fn app_setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_window("main").unwrap();
    window_shadows::set_shadow(&window, true).ok(); // ignore failure
    Ok(())
}

fn main() {
    let args = InitArguments::parse();

    // crash if port is not available
    let port_availability = std::net::TcpListener::bind(format!("0.0.0.0:{}", args.port));
    match port_availability {
        Ok(l) => l.set_nonblocking(true).unwrap(),
        Err(_err) => {
            #[cfg(windows)]
            {
                use windows::core::*;
                use windows::Win32::UI::WindowsAndMessaging::{MessageBoxA, MB_ICONWARNING, MB_OK};
                let message = format!("Port {} is not available!", args.port);
                unsafe {
                    MessageBoxA(
                        None,
                        windows::core::PCSTR(message.as_ptr()),
                        s!("Curses error"),
                        MB_OK | MB_ICONWARNING,
                    );
                }
            }
            return;
        }
    };

    tauri::Builder::default()
        .setup(app_setup)
        .invoke_handler(tauri::generate_handler![get_port, get_native_features, app_close])
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(AppConfiguration { port: args.port })
        .plugin(services::osc::init())
        .plugin(services::web::init())
        .plugin(services::audio::init())
        .plugin(services::windows_tts::init())
        .plugin(services::uberduck_tts::init())
        .plugin(services::piper_tts::init())
        .plugin(services::custom_tts::init())
        .plugin(services::keyboard::init())
        .plugin(services::uwu::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
