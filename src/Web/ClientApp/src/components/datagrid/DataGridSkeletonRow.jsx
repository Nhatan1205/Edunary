import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Skeleton from "@mui/material/Skeleton";

function DataGridSkeletonRow({
  colCount = 3,
  showCheckbox = true,
  showIndex = true,
  showActions = true,
}) {
  const bCell = {
    py: "14px",
    borderBottom: "1px solid #F3F4F6",
  };

  return (
    <TableRow
      sx={{
        "&:last-child td, &:last-child th": { borderBottom: "none" },
      }}
    >
      {showCheckbox && (
        <TableCell padding="checkbox" sx={{ ...bCell, pl: 2 }}>
          <Skeleton variant="rounded" width={16} height={16} />
        </TableCell>
      )}

      {showIndex && (
        <TableCell
          align="center"
          sx={{ ...bCell, width: 52, minWidth: 52 }}
        >
          <Skeleton variant="text" width={20} sx={{ mx: "auto" }} />
        </TableCell>
      )}

      {Array.from({ length: colCount }).map((_, i) => (
        <TableCell key={i} sx={bCell}>
          <Skeleton
            variant="text"
            height={20}
          />
        </TableCell>
      ))}

      {showActions && (
        <TableCell align="right" sx={{ ...bCell, pr: 1.5, width: 52 }}>
          <Skeleton variant="circular" width={28} height={28} sx={{ ml: "auto" }} />
        </TableCell>
      )}
    </TableRow>
  );
}

export default DataGridSkeletonRow;
