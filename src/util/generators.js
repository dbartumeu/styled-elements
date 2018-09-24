function parseAttr(attr, pseudoSelectors) {
  const props = attr.split('.');

  const parsedAttr = {
    mediaQuery: null,
    pseudoSelector: null,
    property: null
  };

  if (props.length < 2) {
    return null;
  }

  switch (props.length) {
    case 2:
      parsedAttr.property = props[1];
      break;
    case 3:
      parsedAttr.property = props[2];
      parsedAttr.pseudoSelector = pseudoSelectors.find(ps => ps === props[1]) ? props[1] : null;
      parsedAttr.mediaQuery = !pseudoSelectors.find(ps => ps === props[1]) ? props[1] : null;
      break;
    case 4:
      parsedAttr.property = props[3];
      parsedAttr.pseudoSelector = pseudoSelectors.find(ps => ps === props[2]) ? props[2] : null;
      parsedAttr.mediaQuery = !pseudoSelectors.find(ps => ps === props[1]) ? props[1] : null;
      break;
  }

  return parsedAttr;
}

export function generateMediaQueries(breakpoints, unit = 'px') {
  let mediaQueries = {}, breakpointKeys;

  if (!breakpoints) {
    return null;
  }

  breakpointKeys = Object.keys(breakpoints).sort((a, b) => {
    return breakpoints[a] - breakpoints[b];
  });

  breakpointKeys.forEach((key, i) => {
    let q = `@media all and (max-width : ${breakpoints[key]}${unit})`;
    const gtQ = `@media all and (min-width : ${breakpoints[key] + 1}${unit})`;

    if (i > 0) {
      const min = `(min-width : ${breakpoints[breakpointKeys[i - 1]] + 1}${unit})`;
      const max = `(max-width : ${breakpoints[key]}${unit})`;

      q = `@media all and ${min} and ${max}`;
    }

    mediaQueries[key] = q;
    mediaQueries[`${key}-land`] = `${q} and (orientation: landscape)`;
    mediaQueries[`${key}-port`] = `${q} and (orientation: portrait)`;

    mediaQueries[`gt-${key}`] = gtQ;
    mediaQueries[`gt-${key}-land`] = `${gtQ} and (orientation: landscape)`;
    mediaQueries[`gt-${key}-port`] = `${gtQ} and (orientation: portrait)`;

  });

  return mediaQueries;
}

/**
 * Generate the rule object based on given attrs
 * Ex:
 * [se].[mediaQuery].[pseudoSelector].[property]
 * [se].[mediaQuery].[property]
 * [se].[pseudoSelector].[property]
 * [se].[property]
 * @param attrs
 * @return rule:
 * {
 *    all: {
 *      properties: [{name:'padding', value: '10px'}],
 *      pseudoSelectors: { hover: properties:[{name:'padding', value: '10px'}] }
 *    },
 *    xs: {
 *      properties: [{name:'padding', value: '10px'}],
 *      pseudoSelectors: { hover: properties:[{name:'padding', value: '10px'}] }
 *    }
 * }
 */
export function generateRuleObject(attrs, pseudoSelectors) {
  const ruleObj = {};

  attrs.forEach(attr => {
    const parsedAttr = parseAttr(attr.name, pseudoSelectors);

    if (parsedAttr) {
      const mq = parsedAttr.mediaQuery;
      const ps = parsedAttr.pseudoSelector;
      const p = {name: parsedAttr.property, value: attr.value};

      if (mq && ps) {
        if (!ruleObj[mq]) {
          ruleObj[mq] = {};
        }
        if (!ruleObj[mq][ps]) {
          ruleObj[mq][ps] = [p];
        } else {
          ruleObj[mq][ps].push(p);
        }
      } else {
        if (mq) {
          if (!ruleObj[mq]) {
            ruleObj[mq] = {};
            ruleObj[mq]['all'] = [p];
          } else {
            ruleObj[mq].push(p);
          }
        } else {
          if (ps) {
            if (!ruleObj['all'][ps]) {
              ruleObj['all'][ps] = [p];
            } else {
              ruleObj['all'][ps].push(p);
            }
          } else {
            if (!ruleObj['all']) {
              ruleObj['all'] = {};
              ruleObj['all']['all'] = [p];
            } else {
              ruleObj['all']['all'].push(p);
            }
          }
        }
      }
    }
  });

  return ruleObj;
}

export function generateSeProperties(selector, mediaQueries, pseudoSelectors, properties) {

}
