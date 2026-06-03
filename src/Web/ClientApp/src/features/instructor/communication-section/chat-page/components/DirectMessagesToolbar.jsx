import React from "react";
import { 
  Stack, 
  FormControlLabel, 
  Checkbox, 
  Select, 
  MenuItem, 
  FormControl, 
  Typography 
} from "@mui/material";

const SORT_OPTIONS = [
  { value: "newestFirst", label: "Newest First" },
  { value: "oldestFirst", label: "Oldest First" },
];

export default function DirectMessagesToolbar({
  filters = { unread: false, important: false, notAnswered: false },
  onFilterChange,
  sortBy = "newestFirst",
  onSortByChange
}) {
  return (
    <Stack
      direction="row"
      spacing={3}
      alignItems="center"
      sx={{ mb: 2 }}
      flexWrap="wrap"
      gap={1}
    >
      {/* Checkboxes Group */}
      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
        <FormControlLabel
          control={
            <Checkbox 
              size="small"
              checked={filters.unread} 
              onChange={(e) => onFilterChange("unread", e.target.checked)}
              sx={{ color: "text.secondary", "&.Mui-checked": { color: "brand.main" } }}
            />
          }
          label={<Typography variant="body2" color="text.secondary" sx={{ fontSize: "14px", fontWeight: 500 }}>Unread</Typography>}
        />
        <FormControlLabel
          control={
            <Checkbox 
              size="small"
              checked={filters.important} 
              onChange={(e) => onFilterChange("important", e.target.checked)}
              sx={{ color: "text.secondary", "&.Mui-checked": { color: "brand.main" } }}
            />
          }
          label={<Typography variant="body2" color="text.secondary" sx={{ fontSize: "14px", fontWeight: 500 }}>Important</Typography>}
        />
        <FormControlLabel
          control={
            <Checkbox 
              size="small"
              checked={filters.notAnswered} 
              onChange={(e) => onFilterChange("notAnswered", e.target.checked)}
              sx={{ color: "text.secondary", "&.Mui-checked": { color: "brand.main" } }}
            />
          }
          label={<Typography variant="body2" color="text.secondary" sx={{ fontSize: "14px", fontWeight: 500 }}>Unanswered</Typography>}
        />
      </Stack>

      {/* Sort By Dropdown */}
      <FormControl size="small" sx={{ minWidth: 160, ml: "auto" }}>
        <Select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.light" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
            fontSize: "14px"
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value} sx={{ fontSize: "14px" }}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
