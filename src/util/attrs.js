export function isValidAttr(attr, mediaQueries, pseudoSelectors, properties) {
  let isValid = false, isValidProp = false, isValidMedia = false, isValidPseudo = false;
  const attrArr = attr.split('.');

  if (attrArr.length < 2) {
    return isValid;
  }

  switch (attrArr.length) {
    case 2:
      isValid = properties.find(prop => prop === attrArr[1]);
      break;
    case 3:
      isValidMedia = mediaQueries && mediaQueries.find(mq => mq === attrArr[1]);
      isValidPseudo = pseudoSelectors && pseudoSelectors.find(ps => ps === attrArr[1]);
      isValidProp = properties.find(prop => prop === attrArr[2]);

      isValid = isValidProp && (isValidMedia || isValidPseudo);
      break;
    case 4:
      isValidMedia = mediaQueries.find(mq => mq === attrArr[1]);
      isValidPseudo = pseudoSelectors.find(ps => ps === attrArr[2]);
      isValidProp = properties.find(prop => prop === attrArr[3]);

      isValid = isValidProp && isValidMedia && isValidPseudo;
      break;
  }

  return isValid;
}
