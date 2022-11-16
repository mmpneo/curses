#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use services::osc::{OscPlugin, register_osc};

mod services;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


fn main() {
    let app = tauri::Builder::default();
    register_osc(app)
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}
