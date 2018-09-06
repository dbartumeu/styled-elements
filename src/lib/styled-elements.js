// import dependencies

let instance = null;

class StyledElements {

  constructor(config) {
    if (!instance) {
      instance = this;
    }

    this._config = config || {};
    this._initialized = new Date();

    return instance;
  }

  get config() {
    return this._config;
  }

  get initialized() {
    return this._initialized;
  }

  /**
   * Initialize Styled Elements
   */
  init() {
    this._initialized = true;
  }
}

export default StyledElements;
