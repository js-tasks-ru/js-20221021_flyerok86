/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (product) {
    if(!Object.keys(product).length) return;

    const pathArr = path.split(".");

    let extractPath = product;
    pathArr.forEach((item) => {
      extractPath = extractPath[item];
    });
    return extractPath;
  };
}