import { FC } from "react";
import { ServiceNetworkState } from "../../types";

const ServiceButton: FC<{status: ServiceNetworkState, onStart: () => void, onStop: () => void}> = ({status, onStart, onStop}) => {
  return <>
    {status === ServiceNetworkState.disconnected && <button className="btn btn-sm btn-primary" onClick={onStart}>Start</button>}
    {status === ServiceNetworkState.error && <button className="btn btn-sm btn-primary" onClick={onStart}>Start</button>}
    
    {status === ServiceNetworkState.connecting && <button className="btn btn-sm btn-primary loading">Connecting</button>}
    {status === ServiceNetworkState.connected && <button className="btn btn-sm btn-primary" onClick={onStop}>Disconnect</button>}
  </>
}

export default ServiceButton;