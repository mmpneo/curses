#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use clap::Parser;
use tauri::{command, State, Manager};
use window_shadows::set_shadow;

use crate::services::AppConfiguration;

mod services;

#[derive(Parser, Debug)]
struct InitArguments {
    #[arg(short, long, default_value_t = 3030)]
    port: u16,
}

#[command]
fn get_port(state: State<'_, InitArguments>) -> u16 {
    state.port
}

fn main() {
    let args = InitArguments::parse();
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            set_shadow(&window, true).expect("Unsupported platform!");
            Ok(())
        })
        .manage(AppConfiguration { port: args.port })
        .invoke_handler(tauri::generate_handler![get_port])
        .plugin(services::osc::init())
        .plugin(services::web::init())
        .plugin(services::windows_tts::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
