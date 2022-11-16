import {IServiceInterface} from "../schema";

type State = {

}

class Service_STT implements IServiceInterface {
  init(): void {
  }

  get state () {
    return window.API.state.services.stt;
  }

}

export default Service_STT;
