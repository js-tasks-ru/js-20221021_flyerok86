/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let stringArr = string.split("");

  let currentLetter;
  let currentIndexLetter = 0;
  return stringArr.filter((item, index, array) => {
    if (currentLetter !== item) {
      currentIndexLetter = 0;
    }

    if (currentIndexLetter >= size) {
      return false;
    }

    currentLetter = item;
    currentIndexLetter++;
    return true;
  }).join('');
}