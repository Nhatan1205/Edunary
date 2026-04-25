import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

// ----------------------------------------------------------------------

/**
 * Empty spacer rows to keep consistent table height across pages.
 *
 * @param {Object} props
 * @param {number} props.emptyRows - Number of empty rows to render
 * @param {number} props.height    - Height per empty row (default: 53)
 */
function DataGridEmptyRows({ emptyRows, height = 53 }) {
  if (!emptyRows) return null;

  return (
    <TableRow sx={{ height: height * emptyRows }}>
      <TableCell colSpan={9} sx={{ borderBottom: "none" }} />
    </TableRow>
  );
}

export default DataGridEmptyRows;
