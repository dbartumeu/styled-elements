// export `concat` function which joins strings by space

/**
 * Add 0 to an string
 * @param str
 * @param len
 * @returns {string}
 */
export function padZero(str, len) {
  len = len || 2;
  const zeros = new Array(len).join('0');

  return (zeros + str).slice(-len);
}

/**
 * Return the equivalent hex color of any rgb/rgba color
 * @param rgb
 * @returns {string}
 */
export function rgb2hex(rgb) {
  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (rgb && rgb.length === 4) ? '#' +
    ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) +
    ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2) +
    ('0' + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

/**
 * Return the contrast color of any hex color
 * @param hex
 * @param light
 * @param dark
 * @returns {string}
 */
export function contrastColor(hex, light = '', dark = '') {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.');
  }
  let r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);

  if (light && dark) {
    if (light.length !== 7) {
      throw new Error('Invalid light HEX color.');
    }
    if (dark.length !== 7) {
      throw new Error('Invalid dark HEX color.');
    }
    // http://stackoverflow.com/a/3943023/112731
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? light : dark;
  }

  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b);
}
