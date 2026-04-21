import Tooltip from "@mui/material/Tooltip";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import InputAdornment from "@mui/material/InputAdornment";
import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";

// ----------------------------------------------------------------------

function DataGridToolbar({
  numSelected = 0,
  filterName = "",
  onFilterName,
  searchPlaceholder = "Search...",
  showSearch = true,
  onBulkDelete = null,
  filterDropdowns = null,
  customRightAction = null,
  onRefresh = null,
  isRefreshing = false,
}) {
  return (
    <Toolbar
      sx={{
        height: 80,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2.5,
        gap: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        transition: "background-color 0.2s ease",
        ...(numSelected > 0 && {
          bgcolor: "rgba(0, 167, 111, 0.06)",
        }),
      }}
    >
      {/* Left side */}
      {numSelected > 0 ? (
        <Typography
          component="div"
          variant="body2"
          sx={{ fontWeight: 600, color: "brand.main", letterSpacing: 0.2 }}
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
          {showSearch && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: 280,
                height: 40,
                px: 1.5,
                borderRadius: "10px",
                border: "1.5px solid",
                borderColor: "grey.300",
                bgcolor: "grey.50",
                transition: "all 0.18s ease",
                "&:focus-within": {
                  bgcolor: "background.paper",
                  borderColor: "#00A76F",
                  boxShadow: "0 0 0 3px rgba(0, 167, 111, 0.10)",
                },
              }}
            >
              <InputAdornment position="start" disablePointerEvents>
                <SearchIcon sx={{ fontSize: 18, color: "grey.400" }} />
              </InputAdornment>
              <InputBase
                fullWidth
                value={filterName}
                onChange={onFilterName}
                placeholder={searchPlaceholder}
                sx={{
                  fontSize: "0.875rem",
                  color: "text.primary",
                  "& input::placeholder": { color: "grey.400", opacity: 1 },
                }}
              />
            </Box>
          )}
          {filterDropdowns}
        </Box>
      )}

      {/* Right side actions */}
      {numSelected > 0 ? (
        onBulkDelete && (
          <Tooltip title="Delete selected">
            <IconButton
              onClick={onBulkDelete}
              size="small"
              sx={{
                color: "error.main",
                bgcolor: "rgba(255,59,59,0.06)",
                borderRadius: "8px",
                "&:hover": { bgcolor: "rgba(255,59,59,0.12)" },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {onRefresh && (
            <Tooltip title="Reload">
              <IconButton
                onClick={onRefresh}
                size="small"
                disabled={isRefreshing}
                sx={{
                  color: "grey.500",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "grey.100", color: "text.primary" },
                  "@keyframes spin": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                  },
                  "& svg": isRefreshing
                    ? { animation: "spin 0.7s linear infinite" }
                    : {},
                }}
              >
                <RefreshIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
          {customRightAction ?? (
            <Tooltip title="Filter">
              <IconButton
                size="small"
                sx={{
                  color: "grey.500",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "grey.100", color: "text.primary" },
                }}
              >
                <FilterListIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Toolbar>
  );
}

export default DataGridToolbar;
