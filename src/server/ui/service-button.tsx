import { FC }                  from "react";
import { ServiceNetworkState } from "../../types";

type Props = {
  status: ServiceNetworkState,
  startLabel?: string,
  stopLabel?: string,
  errorLabel?: string,
  showError?: boolean
  onStart: () => void,
  onStop: () => void,
  onPending?: () => void,
  onError?: () => void,
}

const ServiceButton: FC<Props> = ({status, showError = false, errorLabel = "Error. Try again!", startLabel = "Start", stopLabel = "Stop", onStart, onStop, onPending, onError}) => {
  return <>
    {status === ServiceNetworkState.disconnected && <button className="btn btn-sm btn-primary" onClick={onStart}>{startLabel}</button>}
    {showError && status === ServiceNetworkState.error && <button className="btn btn-sm btn-error" onClick={() => onError?.()}>{errorLabel}</button>}

    {status === ServiceNetworkState.connecting && <button className="btn btn-sm btn-primary" onClick={() => onPending?.()}>Connecting</button>}
    {status === ServiceNetworkState.connected && <button className="btn btn-sm btn-primary" onClick={onStop}>{stopLabel}</button>}
  </>
}

export default ServiceButton;
