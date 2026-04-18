import Box from "@mui/material/Box";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "../../utils/dataGridUtils";

function DataGridHead({
  order,
  onSort,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onSelectAllRows,
  showCheckbox = true,
  showActions = true,
  showIndex = true,
}) {

  const hCell = {
    bgcolor: "#F3F4F6",
    color: "#6B7280",
    fontWeight: 600,
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
    py: 1.75,
    borderBottom: "1px solid #E5E7EB",
    position: "sticky",
    top: 0,
    zIndex: 1,
  };

  return (
    <TableHead>
      <TableRow>
        {showCheckbox && (
          <TableCell padding="checkbox" sx={{ ...hCell, pl: 2 }}>
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={(e) => onSelectAllRows(e.target.checked)}
              size="small"
              sx={{
                color: "#D1D5DB",
                "&.Mui-checked": { color: "#00A76F" },
                "&.MuiCheckbox-indeterminate": { color: "#00A76F" },
              }}
            />
          </TableCell>
        )}

        {showIndex && (
          <TableCell align="center" sx={{ ...hCell, width: 52, minWidth: 52 }}>
            #
          </TableCell>
        )}

        {headLabel.map((col) => (
          <TableCell
            key={col.id}
            align={col.align || "left"}
            sortDirection={orderBy === col.id ? order : false}
            sx={{ ...hCell, width: col.width, minWidth: col.minWidth }}
          >
            {col.id ? (
              <TableSortLabel
                hideSortIcon={false}
                active={orderBy === col.id}
                direction={orderBy === col.id ? order : "asc"}
                onClick={() => onSort(col.id)}
                sx={{
                  color: "#6B7280",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  gap: 0.25,
                  "& .MuiTableSortLabel-icon": {
                    fontSize: "0.9rem",
                    opacity: 0.35,
                    transition: "opacity 0.15s",
                  },
                  "&.Mui-active": {
                    color: "#1C252E",
                    "& .MuiTableSortLabel-icon": { opacity: 0.8, color: "#1C252E" },
                  },
                  "&:hover": {
                    color: "#1C252E",
                    "& .MuiTableSortLabel-icon": { opacity: 0.6 },
                  },
                }}
              >
                {col.label}
                {orderBy === col.id && (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                  </Box>
                )}
              </TableSortLabel>
            ) : (
              col.label || ""
            )}
          </TableCell>
        ))}

        {showActions && (
          <TableCell sx={{ ...hCell, width: 52, minWidth: 52 }} />
        )}
      </TableRow>
    </TableHead>
  );
}

export default DataGridHead;
