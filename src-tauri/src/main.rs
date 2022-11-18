#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use services::osc::register_osc;

mod services;

fn main() {
    let app = tauri::Builder::default();
    register_osc(app)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
