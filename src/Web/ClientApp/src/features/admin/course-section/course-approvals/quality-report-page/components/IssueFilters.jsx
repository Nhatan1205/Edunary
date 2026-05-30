import { Box, FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function IssueFilters({
  filters,
  onChange,
  onReset
}) {
  const handleChange = (field) => (event) => {
    onChange({ ...filters, [field]: event.target.value });
  };

  const handleSearchChange = (event) => {
    onChange({ ...filters, search: event.target.value });
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "0", label: "Course Title & Subtitle" },
    { value: "1", label: "Course Description" },
    { value: "2", label: "Course Image" },
    { value: "3", label: "Video Quality" },
    { value: "4", label: "Audio Quality" },
    { value: "5", label: "Course Content" },
    { value: "6", label: "Intended Learners" },
    { value: "7", label: "Pricing" },
    { value: "8", label: "Instructor Profile" },
    { value: "9", label: "Policy" },
    { value: "10", label: "Other" }
  ];

  const severities = [
    { value: "all", label: "All Severities" },
    { value: "0", label: "Critical" },
    { value: "1", label: "Warning" },
    { value: "2", label: "Suggestion" }
  ];

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "0", label: "Pending" },
    { value: "1", label: "Accepted" },
    { value: "2", label: "Dismissed" }
  ];

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 3 }}>
      {/* Search Input */}
      <TextField
        size="small"
        placeholder="Search issues, rules, locations..."
        value={filters.search || ""}
        onChange={handleSearchChange}
        sx={{ minWidth: 260, flexGrow: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.tertiary", fontSize: 20 }} />
            </InputAdornment>
          ),
          sx: { borderRadius: "10px" }
        }}
      />

      {/* Category Select */}
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="category-filter-label">Category</InputLabel>
        <Select
          labelId="category-filter-label"
          value={filters.category}
          label="Category"
          onChange={handleChange("category")}
          sx={{ borderRadius: "10px" }}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Severity Select */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="severity-filter-label">Severity</InputLabel>
        <Select
          labelId="severity-filter-label"
          value={filters.severity}
          label="Severity"
          onChange={handleChange("severity")}
          sx={{ borderRadius: "10px" }}
        >
          {severities.map((sev) => (
            <MenuItem key={sev.value} value={sev.value}>
              {sev.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Status Select */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="status-filter-label">Status</InputLabel>
        <Select
          labelId="status-filter-label"
          value={filters.status}
          label="Status"
          onChange={handleChange("status")}
          sx={{ borderRadius: "10px" }}
        >
          {statuses.map((stat) => (
            <MenuItem key={stat.value} value={stat.value}>
              {stat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Reset Filter Button */}
      <Button
        variant="text"
        startIcon={<FilterListIcon />}
        onClick={onReset}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          color: "text.secondary",
          borderRadius: "8px",
          "&:hover": { bgcolor: "background.muted" }
        }}
      >
        Clear Filters
      </Button>
    </Box>
  );
}
