import React from "react";
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function ReviewsFilter({ searchQuery, onSearchChange, starFilter, onStarFilterChange, sortBy = "newest", onSortChange }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
      <TextField
        size="small"
        placeholder="Search reviews"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1 }}
      />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <Select value={starFilter} onChange={(e) => onStarFilterChange(Number(e.target.value))}>
          <MenuItem value={0}>All ratings</MenuItem>
          <MenuItem value={5}>5 stars</MenuItem>
          <MenuItem value={4}>4 stars</MenuItem>
          <MenuItem value={3}>3 stars</MenuItem>
          <MenuItem value={2}>2 stars</MenuItem>
          <MenuItem value={1}>1 star</MenuItem>
        </Select>
      </FormControl>

      {onSortChange && (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="highest">Highest Rating</MenuItem>
            <MenuItem value="lowest">Lowest Rating</MenuItem>
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}

export default ReviewsFilter;
