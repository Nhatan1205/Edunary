import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";

// ----------------------------------------------------------------------

function DataGridRow({
  selected = false,
  onSelectRow,
  showCheckbox = true,
  showIndex = true,
  rowIndex = 0,
  actionItems = [],
  row,
  viewLink = null,
  children,
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = useCallback((e) => setAnchorEl(e.currentTarget), []);
  const handleCloseMenu = useCallback(() => setAnchorEl(null), []);

  const hasActions = actionItems.length > 0 || viewLink;
  const hasViewAndActions = viewLink && actionItems.length > 0;

  const bCell = {
    py: "14px",
    fontSize: "0.875rem",
    color: "#1C252E",
    verticalAlign: "middle",
  };

  return (
    <>
      <TableRow
        tabIndex={-1}
        role="checkbox"
        selected={selected}
        sx={{
          "&.Mui-selected": {
            bgcolor: "rgba(0, 167, 111, 0.06)",
            "&:hover": { bgcolor: "rgba(0, 167, 111, 0.10)" },
          },
          "&:hover": { bgcolor: "#F9FAFB" },
          // // Zebra striping — every even row very slightly tinted
          // "&:nth-of-type(even)": {
          //   bgcolor: selected ? undefined : "#FAFAFA",
          //   "&:hover": { bgcolor: selected ? "rgba(0,167,111,0.10)" : "#F3F4F6" },
          // },
          // Apply uniform border-bottom to ALL cells in this row
          "& td, & th": { borderBottom: "1px solid #F3F4F6" },
          // Remove last row separator
          "&:last-child td, &:last-child th": { borderBottom: "none" },
          // Smooth transition
          transition: "background-color 0.12s ease",
        }}
      >
        {/* Checkbox */}
        {showCheckbox && (
          <TableCell padding="checkbox" sx={{ ...bCell, pl: 2 }}>
            <Checkbox
              disableRipple
              checked={selected}
              onChange={onSelectRow}
              size="small"
              sx={{
                color: "#D1D5DB",
                "&.Mui-checked": { color: "#00A76F" },
              }}
            />
          </TableCell>
        )}

        {/* STT */}
        {showIndex && (
          <TableCell
            align="center"
            sx={{
              ...bCell,
              width: 52,
              minWidth: 52,
              color: "#9CA3AF",      // muted gray for index numbers
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            {rowIndex}
          </TableCell>
        )}

        {/* Custom cells from parent */}
        {children}

        {/* Action button */}
        {hasActions && (
          <TableCell align="right" sx={{ ...bCell, pr: 1.5, width: 52 }}>
            <IconButton
              onClick={handleOpenMenu}
              size="small"
              sx={{
                color: "#9CA3AF",
                borderRadius: "8px",
                transition: "all 0.15s",
                "&:hover": {
                  color: "#1C252E",
                  bgcolor: "#F3F4F6",
                },
              }}
            >
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </TableCell>
        )}
      </TableRow>

      {/* Action Popover */}
      {hasActions && (
        <Popover
          open={!!anchorEl}
          anchorEl={anchorEl}
          onClose={handleCloseMenu}
          disableRestoreFocus
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                mt: 0.5,
                minWidth: 160,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow:
                  "0px 4px 6px -2px rgba(16,24,40,0.05), 0px 12px 16px -4px rgba(16,24,40,0.10)",
                overflow: "hidden",
              },
            },
          }}
        >
          <MenuList
            disablePadding
            sx={{
              py: 0.75,
              px: 0.75,
              display: "flex",
              flexDirection: "column",
              gap: 0.25,
              color: "#374151",
              [`& .${menuItemClasses.root}`]: {
                px: 1.5,
                py: 1,
                gap: 1.25,
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "background-color 0.12s",
                [`&:hover`]: { bgcolor: "#F9FAFB" },
                [`&.${menuItemClasses.selected}`]: { bgcolor: "#F3F4F6" },
              },
            }}
          >
            {/* View */}
            {viewLink && (
              <MenuItem
                onClick={() => { handleCloseMenu(); navigate(viewLink); }}
              >
                <VisibilityIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>View</Typography>
              </MenuItem>
            )}

            {hasViewAndActions && <Divider sx={{ my: 0.5, borderColor: "#F3F4F6" }} />}

            {/* Custom actions */}
            {actionItems.map((item, i) => (
              <MenuItem
                key={i}
                onClick={() => { handleCloseMenu(); item.onClick?.(row); }}
                sx={{ color: item.color ?? undefined }}
              >
                {item.icon && (
                  <Box component="span" sx={{ display: "flex", alignItems: "center", color: "inherit" }}>
                    {item.icon}
                  </Box>
                )}
                <Typography variant="body2" sx={{ fontWeight: 500, color: "inherit" }}>
                  {item.label}
                </Typography>
              </MenuItem>
            ))}
          </MenuList>
        </Popover>
      )}
    </>
  );
}

export default DataGridRow;
