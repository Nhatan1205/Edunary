import Box from "@mui/material/Box";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import SearchOffIcon from "@mui/icons-material/SearchOff";

// ----------------------------------------------------------------------

function DataGridNoData({ searchQuery, colSpan = 7 }) {
  return (
    <TableRow>
      <TableCell align="center" colSpan={colSpan} sx={{ border: "none", py: 0 }}>
        <Box
          sx={{
            py: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              bgcolor: "#F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 0.5,
            }}
          >
            <SearchOffIcon sx={{ fontSize: 28, color: "#9CA3AF" }} />
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1C252E" }}>
            {searchQuery ? "No results found" : "No data available"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", textAlign: "center", maxWidth: 300 }}>
            {searchQuery ? (
              <>
                No results for <strong>&quot;{searchQuery}&quot;</strong>.
                <br />
                Check for typos or try different keywords.
              </>
            ) : (
              "There is no data to display at the moment."
            )}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}

export default DataGridNoData;
