use std::net::{SocketAddr, UdpSocket};

use rosc::{encoder, OscMessage, OscPacket, OscType};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{Builder, command, State, Wry};

pub struct OscPlugin {
    socket: Option<UdpSocket>,
}

impl Default for OscPlugin {
    fn default() -> Self {
        let Ok(socket) = UdpSocket::bind("127.0.0.1:3400") else {
            return Self { socket: None };
        };
        OscPlugin {
            socket: Some(socket)
        }
    }
}

impl OscPlugin {
    fn send(&self, rpc: RpcOscMessage) {
        let Some(socket) = &self.socket else {
            return;
        };

        let addr = SocketAddr::from(([127, 0, 0, 1], 9000));
        let args: Vec<OscType> = rpc.args.iter().map(|arg| {
            let t = match arg {
                Value::Null => OscType::Nil,
                Value::Bool(v) => OscType::from(*v),
                Value::Number(v) => if v.is_f64() { OscType::Float(v.as_f64().unwrap() as f32) } else { OscType::Int(v.as_i64().unwrap() as i32) },
                Value::String(v) => OscType::from(v.to_string()),
                Value::Array(_) => OscType::Nil,
                Value::Object(_) => OscType::Nil
            };
            t
        }).collect();
        // println!("Send osc {:?}", &args);

        let msg_buf = encoder::encode(&OscPacket::Message(OscMessage {
            addr: rpc.path,
            args,
        })).unwrap();
        socket.send_to(&msg_buf, addr).unwrap();
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcOscMessage {
    path: String,
    args: Vec<Value>,
}

#[command]
pub fn osc_send(rpc: RpcOscMessage, state: State<OscPlugin>) {
    state.send(rpc);
}

pub fn register_osc(app: Builder<Wry>) -> Builder<Wry> {
    app.manage(OscPlugin::default())
      .invoke_handler(tauri::generate_handler![osc_send])
}


