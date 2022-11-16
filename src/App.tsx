import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import Sidebar from "./components/sidebar";
import EditorView from "./components/editor-view";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <EditorView />
  );
}

export default App;

type PublicState = {
  elements: [
    {
      id: number,
      name: string,
    }
  ],
  scenes: [
    {
      name: "main",
      elements: {
        id: {
          // element data
        }
      }
    }
  ]
}
