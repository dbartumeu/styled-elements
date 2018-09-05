// import dependencies

// return StyledElements class
export class StyledElements {

  constructor(config) {
    this._config = config || {};
    this._initialized = false;
  }

  get config() {
    return this._config;
  }

  get initialized() {
    return this._initialized;
  }

  // initialize plugin
  init() {
    this._initialized = true;
  }
}
