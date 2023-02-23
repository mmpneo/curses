import Logo from "@/server/ui/logo";
import style from "./loading.module.css";

export default function ClientLoadingView() {
  return (
    <div data-theme="curses" className={style.screen}>
      <div className="p-6 py-4 bg-black/30 animate-pulse leading-none rounded-box text-2xl flex flex-col gap-2 text-secondary">
        <Logo />{" "}
        <span className="flex items-center text-lg gap-2">
          {/* <span className={style.spinner}></span> */}
          connecting...
        </span>
      </div>
    </div>
  );
}
