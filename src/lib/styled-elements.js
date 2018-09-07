// import dependencies
import Hashids from 'hashids';
import {ATTRWatcher, DOMWatcher} from './watchers';

let instance = null;

class StyledElements {
  _uIdName = 'seId';
  _selectors = ['styled-elem', 'se'];
  _currentId = 0;
  _elements = {};

  constructor(config) {
    if (!instance) {
      instance = this;
    }

    this.hashids = new Hashids('styled_elements', 5);
    this.domWatcher = new DOMWatcher(this._uIdName);
    this.attrWatcher = new ATTRWatcher(this._uIdName, this._selectors);

    this._config = config || {};
    this._instatiated = new Date();

    return instance;
  }

  get nextId() {
    this._currentId++;
    return this._currentId;
  }

  get config() {
    return this._config;
  }

  get initialized() {
    return this._initialized;
  }

  get instatiated() {
    return this._instatiated;
  }

  handleAdditions(element) {
    element[this._uIdName] = this.hashids.encode(this.nextId);
    element.classList.add();
    this.attrWatcher.watch(element, this.handleChanges.bind(this));
    console.log('Adding element: ', element);
  }

  handleDeletions(element) {
    // Prevent call this function twice. TODO Find a method to implement this inside the watcher
    element.ready = false;
    this.attrWatcher.unwatch(element[this._uIdName]);
    console.log('Removing element: ', element);
  }

  handleChanges(element, attr) {
    console.log('Change element: ', element, attr);
  }

  /**
   * Initialize Styled Elements
   */
  init() {

    this._selectors.forEach(selector => {
      this.domWatcher.watch(`[${selector}]`, this.handleAdditions.bind(this), this.handleDeletions.bind(this));
    });

    this._initialized = new Date();
  }

  destroy() {
    this.domWatcher.unwatch();
  }
}

export default StyledElements;
