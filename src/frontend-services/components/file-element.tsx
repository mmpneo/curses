import { createContext, FC, memo, PropsWithChildren, useContext, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { RiFontSize, RiMusic2Fill, RiPauseMiniFill, RiPlayFill } from "react-icons/ri";
import { FileState } from "../files/schema";

type FileProps = {
  data: FileState,
  actions?: {
    label: string,
    fn: (id: string) => void
  }[]
}

const fileCtx = createContext<FileProps | undefined>(undefined);

function formatBytes(a: number, b = 2, k = 1024) {
  let d = Math.floor(Math.log(a) / Math.log(k));
  return 0 == a ? "0 Bytes" : parseFloat((a / Math.pow(k, d)).toFixed(Math.max(0, b))) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
}

export const FilePicker: FC = () => {
  return <div>


  </div>
}

const FileContainer: FC<PropsWithChildren> = memo(({ children }) => {
  const file = useContext(fileCtx);
  return <div className="flex space-x-2 text-sm">
    <div className="text-base-content p-2 flex-none relative bg-base-200 rounded-lg w-14 h-14 flex items-center justify-center overflow-hidden">
      {children}
    </div>
    <div className="flex flex-col overflow-hidden">
      <span className="font-bold text-ellipsis whitespace-nowrap overflow-hidden">{file?.data.name}</span>
      {/* <span className="font-semibold opacity-50">{data.type}</span> */}
      <span className="font-semibold opacity-50 text-xs">{formatBytes(file!.data.size)}</span>

      <span className="flex space-x-2 font-semibold">
        {file?.actions?.map((action, i) => <span key={i} className="link link-primary" onClick={() => action.fn(file?.data.id)}>{action.label}</span>)}
      </span>
    </div>
  </div>
});


const FileAudio: FC = () => {
  const file = useContext(fileCtx);
  const fileBlobs = useSnapshot(window.APIFrontend.files.fileUrls);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSwitchPlay = () => {
    const onStop = () => {
      setIsPlaying(false);
      audioRef.current?.removeEventListener("ended", onStop);
    };

    if (!audioRef.current)
      return;
    if (isPlaying)
      audioRef.current.pause();
    else {
      audioRef.current.currentTime = 0;
      audioRef.current?.play();
      audioRef.current.addEventListener("ended", onStop)
    }
    setIsPlaying(!isPlaying);
  }
  return <>
    <audio className="hidden" ref={audioRef} src={fileBlobs[file!.data.id]} />
    <RiMusic2Fill size={42} />
    <button className="absolute bottom-2 right-2 btn btn-xs btn-circle btn-accent" onClick={handleSwitchPlay}>{isPlaying ? <RiPauseMiniFill /> : <RiPlayFill />}</button>
  </>
}


const FileVideo: FC = () => {
  const file = useContext(fileCtx);
  const fileBlobs = useSnapshot(window.APIFrontend.files.fileUrls);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSwitchPlay = () => {
    const onStop = () => {
      setIsPlaying(false);
      videoRef.current?.removeEventListener("ended", onStop);
    };

    if (!videoRef.current)
      return;
    if (isPlaying)
      videoRef.current.pause();
    else {
      videoRef.current.currentTime = 0;
      videoRef.current?.play();
      videoRef.current.addEventListener("ended", onStop)
    }
    setIsPlaying(!isPlaying);
  }
  return <>
    <video className="absolute inset-0 w-full h-full" ref={videoRef} src={fileBlobs[file!.data.id]} />
    <button className="absolute bottom-2 right-2 btn btn-sm btn-circle btn-accent" onClick={handleSwitchPlay}>{isPlaying ? <RiPauseMiniFill /> : <RiPlayFill />}</button>
  </>
}

const FileImage: FC = () => {
  const file = useContext(fileCtx);
  const fileBlobs = useSnapshot(window.APIFrontend.files.fileUrls);
  return <img className="w-full h-full object-contain" src={fileBlobs[file!.data.id]} />
}

const FileFont: FC = () => {
  return <RiFontSize size={48} />
}

const FileElement: FC<FileProps> = (props) => {
  return <fileCtx.Provider value={props}>
    <FileContainer>
      {props.data.type.includes("image/") && <FileImage />}
      {props.data.type.includes("text/") && <div>Text</div>}
      {props.data.type.includes("audio/") && <FileAudio />}
      {props.data.type.includes("video/") && <FileVideo />}
      {props.data.type.includes("font/") && <FileFont />}
    </FileContainer>
  </fileCtx.Provider>
}

export default FileElement;
