// ----------------------------------------------------------------------

export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: "1px",
  height: "1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  clip: "rect(0 0 0 0)",
};

// ----------------------------------------------------------------------

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

// ----------------------------------------------------------------------

export function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------

/**
 * Apply search filter + sorting to data.
 *
 * @param {Object} params
 * @param {Array}  params.inputData   - Raw data array
 * @param {Function} params.comparator - Comparator from getComparator()
 * @param {string} params.filterName  - Search query string
 * @param {string|Function} params.filterKey - Field name to search on (default: "name"),
 *                                             or a custom function (item) => string
 */
export function applyFilter({ inputData, comparator, filterName, filterKey = "name" }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let result = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    const query = filterName.toLowerCase();
    result = result.filter((item) => {
      const value =
        typeof filterKey === "function" ? filterKey(item) : item[filterKey];
      return value && String(value).toLowerCase().indexOf(query) !== -1;
    });
  }

  return result;
}
