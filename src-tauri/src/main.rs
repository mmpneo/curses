#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use clap::Parser;
use serde::{Deserialize, Serialize};
use tauri::{command, State, Manager};
use window_shadows::set_shadow;
use windows::{Win32::UI::WindowsAndMessaging::{MB_OK, MB_ICONWARNING, MessageBoxA}, s, core::PCSTR};

use crate::services::AppConfiguration;

mod services;

#[derive(Parser, Debug)]
struct InitArguments {
    #[arg(short, long, default_value_t = 3030)]
    port: u16,
}


#[derive(Serialize, Deserialize)]
struct NativeFeatures {
    background_input: bool
}

#[command]
fn get_native_features() -> NativeFeatures {
    NativeFeatures {
        // background_input: true
        background_input: false
        // background_input: cfg!(background_input)
    }
}

#[command]
fn get_port(state: State<'_, InitArguments>) -> u16 {
    state.port
}

fn main() {
    let args = InitArguments::parse();
    
    // crash if port is not available
    let port_availability = std::net::TcpListener::bind(format!("0.0.0.0:{}", args.port));
    match port_availability {
        Ok(l) => l.set_nonblocking(true).unwrap(),
        Err(_err) => {
            unsafe{
                MessageBoxA(None, PCSTR(format!("Port {} is not available!", args.port).as_ptr()), s!("Curses error"), MB_OK | MB_ICONWARNING);}
            return;
        },
    };

    
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            set_shadow(&window, true).expect("Unsupported platform!");
            Ok(())
        })
        .manage(AppConfiguration { port: args.port })
        .invoke_handler(tauri::generate_handler![get_port, get_native_features])
        .plugin(services::osc::init())
        .plugin(services::web::init())
        .plugin(services::audio::init())
        .plugin(services::windows_tts::init())
        // .plugin(services::windows_stt::init())
        // #[cfg(background_input)]
        
        // .plugin(services::keyboard::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
