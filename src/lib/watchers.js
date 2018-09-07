// import dependencies
import {blacklistAttrs} from '../config/attrs';

export class DOMWatcher {
  constructor(uIdName) {
    this.listeners = [];
    this.doc = document;
    this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    this.observer;
    this.uIdName = uIdName;
  }

  _checkAdditions() {
    this.listeners.forEach(listener => {
      const elements = this.doc.querySelectorAll(listener.selector);

      for (let i = 0, jLen = elements.length, element; i < jLen; i++) {
        element = elements[i];
        if (!element.ready) {
          element.ready = true;

          listener.add.call(element, element);
        }
      }
    });
  }

  _checkDeletions(elements) {
    elements.forEach(node => {
      if (node[this.uIdName]) {
        this.listeners.forEach(listener => {
          if (node.ready) {
            listener.remove.call(node, node);
          }
        });
      }
    });
  }

  _check(mutations) {
    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length) {
        this._checkAdditions();
      }
      if (mutation.removedNodes && mutation.removedNodes.length) {
        this._checkDeletions(mutation.removedNodes);
      }
    });
  }

  watch(selector, addFn, removeFn) {

    this.listeners.push({
      selector: selector,
      add: addFn,
      remove: removeFn
    });

    if (!this.observer) {
      this.observer = new this.MutationObserver(this._check.bind(this));
      this.observer.observe(this.doc.documentElement, {
        childList: true,
        subtree: true
      });
    }

    this._checkAdditions();
  }

  unwatch() {
    this.observer.disconnect();
  }

}

export class ATTRWatcher {
  _elements = {};

  constructor(uIdName, selectors) {
    this.uIdName = uIdName;
    this.selectors = [...blacklistAttrs, ...selectors];
  }

  watch(element, changesFn) {
    const id = element[this.uIdName];

    this._elements[id] = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        changesFn(mutation.target, mutation.attributeName);
      });
    });

    if (element.hasAttributes()) {
      const attrs = element.attributes;

      for (let i = attrs.length - 1; i >= 0; i--) {
        if (!this.selectors.find(selector => selector === attrs[i].name)) {
          changesFn(element, attrs[i].name);
        }
      }
    }

    this._elements[id].observe(element, {attributes: true});
  }

  unwatch(id) {
    this._elements[id].disconnect();
    delete this._elements[id];
  }
}
