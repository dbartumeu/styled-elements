// import dependencies
import XXH from 'xxhashjs';
import {defaults} from '../config';
import {generateRuleObject} from '../util/generators';

export default class RuleManager {

  constructor(mediaQueries) {
    this.sheetId = 0;

    this.rules = {};
    this.sheets = {};

    this.mediaQueries = mediaQueries;
    this.pseudoSelectors = defaults.pseudoSelectors;
  }

  _getSheetId() {
    const sheets = Object.keys(this.sheets);

    if (sheets.length > 0) {
      for (let i = 0, sheet; i < sheets.length; i++) {
        sheet = sheets[i];

        if (this.sheets[sheet] < 1000) {
          return sheet;
        }

      }
    }

    return this._addSheet();
  }

  _getRulePos(rules, ruleName) {
    for (let i = 0, rule; i < rules.length; i++) {
      rule = rules[i];
      // console.log(rule);
      if (rule.selectorText === '.' + ruleName) {
        return i;
      }
    }

    return null;
  }

  _generateRuleName(properties) {
    const _properties = properties.map(prop => prop.name + prop.value).join();

    return 'sr' + XXH.h32(_properties, 0xABCD).toString(16);
  }

  _buildProps(props) {
    let strProps = [];

    for (let i = 0, prop; i < props.length; i++) {
      prop = props[i];
      strProps.push(`${prop.name}:${prop.value}`);
    }
    return strProps.join(';');
  }

  _buildRules(selector, props) {
    const ruleObj = generateRuleObject(props, this.pseudoSelectors);
    const ruleMediaQueries = Object.keys(ruleObj);

    let rules = [];

    ruleMediaQueries.forEach(mq => {
      if (mq === 'all') {
        const rulePseudoSelectors = Object.keys(ruleObj[mq]);

        rulePseudoSelectors.forEach(ps => {
          if (ps === 'all') {
            rules.push(`${selector} { ${this._buildProps(ruleObj[mq][ps])} } `);
          } else {
            rules.push(`${selector}:${ps} { ${this._buildProps(ruleObj[mq][ps])} } `);
          }
        });
      } else {
        let rs = '';

        rs += `${this.mediaQueries[mq]} { `;
        const rulePseudoSelectors = Object.keys(ruleObj[mq]);

        rulePseudoSelectors.forEach(ps => {
          if (ps === 'all') {
            rs += `${selector} { ${this._buildProps(ruleObj[mq][ps])} }`;
          } else {
            rs += `${selector}:${ps} { ${this._buildProps(ruleObj[mq][ps])} }`;
          }
        });

        rs += ' } ';

        rules.push(rs);
      }
    });

    // console.log(rules);
    return rules;
  }

  _addSheet() {
    const sheet = document.createElement('style');

    this.sheetId++;
    sheet.setAttribute('id', `se-sheet-${this.sheetId}`);
    document.head.appendChild(sheet);
    this.sheets[`se-sheet-${this.sheetId}`] = 0;
    return `se-sheet-${this.sheetId}`;
  }

  _removeSheet(sheetId) {
    delete this.sheets[sheetId];
    document.getElementById(sheetId).outerHTML = '';
  }

  _addRule(ruleName, props) {
    const sheetId = this._getSheetId();
    const sheet = document.getElementById(sheetId).sheet;
    const selector = `.${ruleName}`;
    const rules = this._buildRules(selector, props);

    for (let i = 0; i < rules.length; i++) {
      sheet.insertRule(rules[i], sheet.rules.length);
    }

    this.sheets[sheetId]++;

    this.rules[ruleName] = {
      ref: 1,
      sheet: sheetId
    };

    console.log(sheet);

    return ruleName;
  }

  _updateRule(oldRule, properties) {
    const newRule = this._generateRuleName(properties);

    if (!this.rules[newRule] && oldRule !== newRule) {
      this._addRule(newRule, properties);
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
      el.rule = this._updateRule(null, attrs);
      el.classList.add(el.rule);
    } else {
      el.classList.remove(el.rule);
      el.rule = this._updateRule(el.rule, attrs);
      el.classList.add(el.rule);
    }
  }

  removeRule(ruleName) {
    const rule = this.rules[ruleName];
    const sheet = document.getElementById(rule.sheet).sheet;
    const pos = this._getRulePos(sheet.cssRules, ruleName);

    sheet.deleteRule(pos);
    this.sheets[rule.sheet]--;
    if (this.sheets[rule.sheet] === 0) {
      this._removeSheet(rule.sheet);
    }
    delete this.rules[ruleName];
  }

}
