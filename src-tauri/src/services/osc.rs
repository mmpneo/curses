use std::net::{SocketAddr, UdpSocket};
use rosc::{encoder, OscMessage, OscPacket, OscType};
use serde::{Deserialize, Serialize};
use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};


pub struct OscPlugin {
    socket: Option<UdpSocket>,
}

impl Default for OscPlugin {
    fn default() -> Self {
        let Ok(socket) = UdpSocket::bind("127.0.0.1:3400") else {
            return Self { socket: None };
        };
        OscPlugin { socket: Some(socket) }
    }
}

impl OscPlugin {
    fn send(&self, rpc: RpcOscMessage) {
        let Some(socket) = &self.socket else {
            return;
        };

        let addr = SocketAddr::from(([127, 0, 0, 1], 9000));
        let args: Vec<OscType> = rpc
            .args
            .iter()
            .map(|arg| {
                let tt = match arg {
                    OscValue::Bool(v) => OscType::from(*v),
                    OscValue::Float(v) => OscType::Float(*v as f32),
                    OscValue::Int(v) => OscType::Int(*v as i32),
                    OscValue::String(v) => OscType::from(v.to_string()),
                    _ => OscType::Nil,
                };
                tt
            })
            .collect();

        let msg_buf = encoder::encode(&OscPacket::Message(OscMessage { addr: rpc.path, args })).unwrap();
        socket.send_to(&msg_buf, addr).unwrap();
    }
}

#[derive(Serialize, Deserialize, Debug)]
enum OscValue {
    Bool(bool),
    Float(f64),
    Int(i64),
    String(String),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcOscMessage {
    path: String,
    args: Vec<OscValue>,
}

#[command]
fn send(rpc: RpcOscMessage, state: State<OscPlugin>) {
    state.send(rpc);
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("osc")
        .invoke_handler(tauri::generate_handler![send])
        .setup(|app| {
            app.manage(OscPlugin::default());
            Ok(())
        })
        .build()
}
