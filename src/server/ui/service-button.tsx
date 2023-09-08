import { FC }                  from "react";
import { ServiceNetworkState } from "../../types";
import { useTranslation } from "react-i18next";

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

const ServiceButton: FC<Props> = ({status, showError = false, errorLabel = "Error. Try again!", startLabel = "common.btn_start", stopLabel = "common.btn_stop", onStart, onStop, onPending, onError}) => {
  const {t} = useTranslation();
  return <>
    {status === ServiceNetworkState.disconnected && <button className="btn btn-sm btn-primary" onClick={onStart}>{t(startLabel)}</button>}
    {showError && status === ServiceNetworkState.error && <button className="btn btn-sm btn-error" onClick={() => onError?.()}>{errorLabel}</button>}

    {status === ServiceNetworkState.connecting && <button className="btn btn-sm btn-primary" onClick={() => onPending?.()}>{t('common.btn_connecting')}</button>}
    {status === ServiceNetworkState.connected && <button className="btn btn-sm btn-primary" onClick={onStop}>{t(stopLabel)}</button>}
  </>
}

export default ServiceButton;
