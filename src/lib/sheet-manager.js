// import dependencies
import cssobj from 'cssobj';

export default class SheetManager {

  sheetid = 0;

  constructor() {
    this.sheets = [];
    // this.sheetManager = cssobj(this.sheet);
  }

  _getSheet(rule) {
    if (this.sheets.length) {
      for (let i = this.sheets.length - 1, sheet; i >= 0; i--) {
        sheet = this.sheets[i];
        if (sheet['.' + rule]) {
          return sheet;
        }
        if (Object.keys(sheet).length < 100) {
          return sheet;
        }
      }
    }

    this.sheets.push(cssobj({}));
    return this.sheets[this.sheets.length - 1];
  }

  attachRule(rule, data) {
    const sheet = this._getSheet(rule);

    sheet['.' + rule] = {};

    data.forEach(p => {
      const name = p.name.replace('se.', '');

      // this.sheet['.' + ruleName][name] = p.value;
      sheet['.' + rule][name] = p.value;
    });

    console.log(sheet);

    sheet.update();
  }

  detachRule(rule) {
    const sheet = this._getSheet(rule);

    delete sheet['.' + rule];
    if (Object.keys(sheet).length === 0) {
      // sheet.cssdom.parent.removeChild(el);
    } else {
      sheet.update();
    }

  }

}
