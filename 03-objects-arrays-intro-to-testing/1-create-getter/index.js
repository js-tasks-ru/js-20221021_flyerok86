/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArr = path.split(".");

  return function (product) {
    if (!Object.keys(product).length) return;

    let extractPath = product;
    pathArr.forEach((item) => {
      extractPath = extractPath[item];
    });
    return extractPath;
  };
}
