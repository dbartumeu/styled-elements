// import dependencies
import XXH from 'xxhashjs';
// import cssobj from 'cssobj';

export default class RuleManager {

  constructor() {
    this.sheetId = 0;

    this.rules = {};
    this.sheets = {};
  }

  addSheet() {
    const sheet = document.createElement('style');

    this.sheetId++;
    sheet.setAttribute('id', `se-sheet-${this.sheetId}`);
    document.head.appendChild(sheet);
    this.sheets[`se-sheet-${this.sheetId}`] = 0;
    return `se-sheet-${this.sheetId}`;
  }

  removeSheet(sheetId) {
    delete this.sheets[sheetId];
    document.getElementById(sheetId).outerHTML = '';
  }

  _getSheetId() {
    const sheets = Object.keys(this.sheets);

    // console.log(sheets);
    if (sheets.length > 0) {
      for (let i = 0, sheet; i < sheets.length; i++) {
        sheet = sheets[i];

        // console.log(this.sheets[sheet]);
        if (this.sheets[sheet] < 1000) {
          return sheet;
        }

      }
    }

    return this.addSheet();
  }

  _generateRuleName(properties) {
    const _properties = properties.map(prop => prop.name + prop.value).join();

    return 'sr' + XXH.h32(_properties, 0xABCD).toString(16);
  }

  _getRuleProps(props) {
    let strProps = [];

    for (let i = 0, prop, name, value; i < props.length; i++) {
      prop = props[i];
      name = prop.name.replace('se.', '');
      value = prop.value;
      strProps.push(`${name}:${value}`);
    }
    return strProps.join(';');
  }

  addRule(ruleName, props) {
    const sheetId = this._getSheetId();
    const sheet = document.getElementById(sheetId).sheet;
    const selector = `.${ruleName}`;
    const position = sheet ? sheet.rules.length : 0;
    const rule = `${selector} { ${this._getRuleProps(props)} }`;

    // console.log(rule);
    sheet.insertRule(rule, sheet.rules.length);
    this.sheets[sheetId]++;

    this.rules[ruleName] = {
      ref: 1,
      sheet: sheetId,
      position: position
    };

    return ruleName;
  }

  removeRule(ruleName) {
    const rule = this.rules[ruleName];
    const sheet = document.getElementById(rule.sheet).sheet;

    sheet.deleteRule(rule.position);
    this.sheets[rule.sheet]--;
    if (this.sheets[rule.sheet] === 0) {
      this.removeSheet(rule.sheet);
    }
    console.log('removeRule', rule);
    delete this.rules[ruleName];
  }

  updateRule(oldRule, properties) {
    const newRule = this._generateRuleName(properties);

    if (!this.rules[newRule] && oldRule !== newRule) {
      this.addRule(newRule, properties);
    } else {
      this.rules[newRule].ref++;
    }

    if (oldRule && oldRule !== newRule) {
      this.rules[oldRule].ref--;
      if (this.rules[oldRule].ref === 0) {
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

    console.log('rules', this.rules);
    console.log('sheets', this.sheets);
  }

}
