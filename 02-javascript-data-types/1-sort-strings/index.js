/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
 export function sortStrings(arr, param = "asc") {
  if (param !== "asc" && param !== "desc") {
    throw "something went wrong";
  }

  const compare = (a, b) => {
    return a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" });
  };

  return [...arr].sort((p1, p2) => {
    if (param === "asc") {
      return compare(p1, p2);
    }

    if (param === "desc") {
      return compare(p2, p1);
    }
  });
}
