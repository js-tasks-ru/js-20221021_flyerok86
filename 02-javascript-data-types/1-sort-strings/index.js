/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  if (param === "asc") {
    return [...arr].sort((p1, p2) =>
      p1.localeCompare(p2, ["ru", "en"], { caseFirst: "upper" })
    );
  }

  if (param === "desc") {
    return [...arr].sort((p1, p2) =>
      p2.localeCompare(p1, ["ru", "en"], { caseFirst: "upper" })
    );
  }
}