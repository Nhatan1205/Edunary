import { useState, useMemo, useCallback, useEffect, memo } from "react";
import { useNavigate } from "react-router";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import adminMenuConfig from "./adminMenuConfig";

// Flatten menu config into a searchable list of items
function flattenMenuItems(items, parentLabel = "") {
  const result = [];
  items.forEach((item) => {
    if (item.children) {
      result.push(
        ...flattenMenuItems(
          item.children,
          parentLabel ? `${parentLabel} / ${item.title}` : item.title
        )
      );
    }
    if (item.url) {
      result.push({
        id: item.id,
        title: item.title,
        url: item.url,
        group: parentLabel || "",
      });
    }
  });
  return result;
}

const allItems = flattenMenuItems(adminMenuConfig.items);

function AdminSearchDialog({ open, onClose }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Reset search when dialog opens
  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const query = search.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query)
    );
  }, [search]);

  const handleItemClick = useCallback(
    (url) => {
      navigate(url);
      onClose();
    },
    [navigate, onClose]
  );

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
            bgcolor: "background.paper",
            backgroundImage: "none",
            maxHeight: "60vh",
          },
        },
        backdrop: {
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      {/* Search input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <SearchOutlinedIcon sx={{ color: "text.disabled", fontSize: 22 }} />
        <InputBase
          autoFocus
          fullWidth
          placeholder="Search..."
          value={search}
          onChange={handleSearchChange}
          sx={{
            fontSize: "1rem",
            color: "text.primary",
            "& input::placeholder": {
              color: "text.disabled",
              opacity: 1,
            },
          }}
        />
        <Box
          sx={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "text.disabled",
            bgcolor: "background.muted",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "6px",
            px: 0.8,
            py: 0.3,
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={onClose}
        >
          Esc
        </Box>
      </Box>

      {/* Results */}
      <DialogContent sx={{ p: 0 }}>
        <List disablePadding>
          {filteredItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => handleItemClick(item.url)}
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "rgba(0,0,0,0.04)",
                "&:hover": {
                  bgcolor: "brand.lighter",
                },
                "&:hover .search-overview-chip": {
                  opacity: 1,
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: "0.95rem",
                    }}
                  >
                    {item.title}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.disabled",
                      fontSize: "0.8rem",
                      mt: 0.25,
                    }}
                  >
                    {item.url}
                  </Typography>
                }
              />
              <Chip
                className="search-overview-chip"
                label="Overview"
                size="small"
                sx={{
                  opacity: 0,
                  transition: "opacity 0.15s ease",
                  bgcolor: "text.primary",
                  color: "text.inverse",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  height: 26,
                  borderRadius: "6px",
                }}
              />
            </ListItemButton>
          ))}
          {filteredItems.length === 0 && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ color: "text.disabled" }}
              >
                No results found for "{search}"
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default memo(AdminSearchDialog);
