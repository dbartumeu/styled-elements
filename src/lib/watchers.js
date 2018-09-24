// import dependencies
import {isValidAttr} from '../util/attrs';

export class DOMWatcher {
  constructor(uIdName) {
    this.listener = {};
    this.doc = document;
    this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    this.observer;
    this.uIdName = uIdName;
  }

  _isStyledElement(el) {
    const attrSelector = this.listener.selector;
    const attrs = el.attributes;

    if (attrs.length) {
      for (let i = 0, jLen = attrs.length, attr; i < jLen; i++) {
        attr = attrs[i].name;
        if (attr.startsWith(attrSelector)) {
          return true;
        }
      }
    }

    return false;
  }

  _checkAdditions(elements) {

    if (elements) {
      for (let i = 0, jLen = elements.length, element; i < jLen; i++) {
        element = elements[i];
        if (this._isStyledElement(element)) {
          if (!element.ready) {
            element.ready = true;
            this.listener.add.call(element, element);
          }
        }
      }
    } else {
      const elements = this.doc.querySelectorAll('body *');

      for (let i = 0, jLen = elements.length, element; i < jLen; i++) {
        element = elements[i];
        if (this._isStyledElement(element)) {
          if (!element.ready) {
            element.ready = true;
            this.listener.add.call(element, element);
          }
        }
      }
    }

  }

  _checkDeletions(elements) {
    elements.forEach(node => {
      if (node[this.uIdName]) {
        if (node.ready) {
          this.listener.remove.call(node, node);
        }
      }
    });
  }

  _check(mutations) {
    mutations.forEach(mutation => {
      // if (mutation.target != '[object HTMLBodyElement]' &&
      //   mutation.target != '[object HTMLScriptElement]' &&
      //   (mutation.removedNodes.length != 0 ||
      //     mutation.addedNodes.length != 0)) {
      if (mutation.addedNodes && mutation.addedNodes.length) {
        this._checkAdditions(mutation.addedNodes);
      }
      if (mutation.removedNodes && mutation.removedNodes.length) {
        this._checkDeletions(mutation.removedNodes);
      }
    });
  }

  watch(selector, addFn, removeFn) {

    this.listener = {
      selector: selector,
      add: addFn,
      remove: removeFn
    };

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

  constructor(uIdName, selector, mediaQueries, pseudoSelectors, properties) {
    this.uIdName = uIdName;
    this.selector = selector;
    this.mediaQueries = mediaQueries;
    this.pseudoSelectors = pseudoSelectors;
    this.properties = properties;
  }

  watch(element, changesFn) {
    const id = element[this.uIdName];
    const self = this;

    this._elements[id] = new MutationObserver((mutations) => {
      const attrs = element.attributes;
      const emitAttrs = [];
      let emit = false;

      for (let i = 0, jLen = mutations.length, mutation; i < jLen; i++) {
        mutation = mutations[i];
        if (isValidAttr(mutation.attributeName, self.mediaQueries, self.pseudoSelectors, self.properties)) {
          emit = true;
        }
      }

      if (emit) {
        for (let i = attrs.length - 1; i >= 0; i--) {
          if (isValidAttr(attrs[i].name, self.mediaQueries, self.pseudoSelectors, self.properties)) {
            emitAttrs.push({name: attrs[i].name, value: attrs[i].value});
          }
        }
        changesFn(element, emitAttrs);
      }
    });

    if (element.hasAttributes()) {
      const attrs = element.attributes;
      const emitAttrs = [];

      for (let i = attrs.length - 1; i >= 0; i--) {
        if (isValidAttr(attrs[i].name, self.mediaQueries, self.pseudoSelectors, self.properties)) {
          emitAttrs.push({name: attrs[i].name, value: attrs[i].value});
        }
      }

      if (emitAttrs.length) {
        changesFn(element, emitAttrs);
      }
    }

    this._elements[id].observe(element, {attributes: true});
  }

  unwatch(id) {
    this._elements[id].disconnect();
    delete this._elements[id];
  }
}
