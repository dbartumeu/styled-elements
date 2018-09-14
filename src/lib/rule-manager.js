// import dependencies
import XXH from 'xxhashjs';
import cssobj from 'cssobj';

export default class RuleManager {

  constructor() {
    this.rules = {};
    this.sheet = {};
    this.sheetManager = cssobj(this.sheet);
  }

  // TODO try a weak map
  _generateRuleName(properties) {
    const _properties = properties.map(prop => prop.name + prop.value).join();

    return 'sr' + XXH.h32(_properties, 0xABCD).toString(16);
  }

  addRule(ruleName, props) {
    this.sheet['.' + ruleName] = {};

    props.forEach(p => {
      const name = p.name.replace('se.', '');

      this.sheet['.' + ruleName][name] = p.value;
    });

    this.sheetManager.update();

    this.rules[ruleName] = 1;
    return ruleName;
  }

  removeRule(rule) {
    delete this.sheet['.' + rule];
    this.sheetManager.update();
    delete this.rules[rule];
  }

  updateRule(oldRule, properties) {
    const newRule = this._generateRuleName(properties);

    if (!this.rules[newRule] && oldRule !== newRule) {
      this.addRule(newRule, properties);
    } else {
      this.rules[newRule]++;
    }

    if (oldRule && oldRule !== newRule) {
      this.rules[oldRule]--;
      if (this.rules[oldRule] === 0) {
        this.removeRule(oldRule);
      }
    }

    return newRule;
  }

  setRule(el, attrs) {
    if (!el.rule) {
      el.rule = this.updateRule(null, attrs);
      el.classList.add(el.rule);
    } else {
      el.classList.remove(el.rule);
      el.rule = this.updateRule(el.rule, attrs);
      el.classList.add(el.rule);
    }
  }

}
