
use serde::Deserialize;
use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Runtime,
};

#[derive(Deserialize, Debug)]
struct TranslateResp {
    src: String,
    sentences: SentenceType,
}

#[derive(Deserialize, Debug)]
struct TranslationBody {
    trans: String,
    orig: String,
    backend: i32,
}
#[derive(Deserialize, Debug)]
struct TranslitBody {
    translit: String,
    src_translit: Option<String>,
}

#[derive(Deserialize, Debug)]
struct SentenceType(TranslationBody, TranslitBody);

// unused

#[command]
async fn translate(value: String) {
    // url query
    // client=at',
    // &dt=t',  // return sentences
    // &dt=rm', // add translit to sentences
    // &dj=1',  // result as pretty json instead of deep nested arrays

    // body
    // sl: from,
    // tl: to,
    // q: this.inputText,
    println!("{:#?}", value);

    // let client = reqwest::Client::new();
    // let resp = client
    //     .post("https://translate.google.com/translate_a/single?client=at&dt=t&dt=rm&dj=1")
    //     .body(format!("sl=en&tl=ru&q={}", value))
    //     .header("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
    //     .send()
    //     .await
    //     .unwrap();
    // let st = resp.text().await;
    // println!("{:#?}", st);
    // let json = st.json::<TranslateResp>().await;
    // match json {
    //     Ok(json) => {
    //         println!("{:#?}", json.sentences.0.trans);
    //     }
    //     Err(_) => {}
    // }

    // Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("translate")
        .invoke_handler(tauri::generate_handler![translate])
        .build()
}
