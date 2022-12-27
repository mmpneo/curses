import Backend from "./backend-services";
import Frontend from "./frontend-services";

class API {
  public backend!: Backend;
  public frontend!: Frontend;


  async init() {
    this.backend = new Backend();
    this.frontend = new Frontend();

    await this.backend.init();
    await this.frontend.init();

  }
}

export default API;