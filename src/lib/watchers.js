// import dependencies

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

    for (let i = 0, jLen = attrs.length, attr; i < jLen; i++) {
      attr = attrs[i].name;
      if (attr.startsWith(attrSelector)) {
        return true;
      }
    }

    return false;
  }

  _checkAdditions() {
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
        this._checkAdditions();
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

  constructor(uIdName, selector, properties) {
    this.uIdName = uIdName;
    this.properties = properties.map(property => selector + property);
  }

  watch(element, changesFn) {
    const id = element[this.uIdName];
    const self = this;

    this._elements[id] = new MutationObserver((mutations) => {
      const attrs = element.attributes;
      const emitAttrs = [];
      let emit = false;

      mutations.forEach(mutation => {
        if (self.properties.find(watchedAttr => watchedAttr === mutation.attributeName)) {
          emit = true;
        }
      });

      if (emit) {
        for (let i = attrs.length - 1; i >= 0; i--) {
          if (self.properties.find(watchedAttr => watchedAttr === attrs[i].name)) {
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
        if (this.properties.find(property => property === attrs[i].name)) {
          emitAttrs.push({name: attrs[i].name, value: attrs[i].value});
        }
      }

      if (emitAttrs.length) {
        changesFn(element, emitAttrs);
      }
    }

    this._elements[id].observe(element, {attributes: true, attributeFilter: this.attrs});
  }

  unwatch(id) {
    this._elements[id].disconnect();
    delete this._elements[id];
  }
}
