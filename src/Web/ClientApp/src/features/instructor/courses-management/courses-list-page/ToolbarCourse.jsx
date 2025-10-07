import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
  Box,
  IconButton,
} from "@mui/material";
import { Link as RouterLink } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

function ToolbarCourse({
  searchInput,
  filter,
  onSearchInputChange,
  onSearchClick,
  onFilterChange,
}) {
  return (
    <Box
      sx={{
        mb: 3,
        py: 2,
      }}
    >
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        {/* Left section: Search bar and Filter */}
        <div className="d-flex flex-column flex-sm-row gap-3 w-100 w-md-auto">
          <TextField
            size="small"
            placeholder="Search your courses"
            value={searchInput}
            onChange={onSearchInputChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: "100%", sm: "300px", md: "350px" },
              backgroundColor: "white",
            }}
          />

          <IconButton
            size={"medium"}
            aria-label="show cart items"
            onClick={onSearchClick}
            sx={{
              color: "text.inverse",
              padding: "6px",
              borderRadius: "4px",
              backgroundColor: "brand.main",
              "&:hover": {
                backgroundColor: "brand.dark",
              },
            }}
          >
            <SearchIcon sx={{ fontSize: "24px" }} />
          </IconButton>

          <FormControl
            size="small"
            sx={{
              width: { xs: "100%", sm: "140px" },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "brand.main",
              },
              "&:hover": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "brand.main",
                },
              },
            }}
          >
            <Select
              value={filter}
              onChange={onFilterChange}
              sx={{
                backgroundColor: "white",
                color: "brand.main",
              }}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="title">Title A-Z</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Right section: New course button */}
        <Button
          component={RouterLink}
          to="/course/create"
          variant="contained"
          disableElevation
          startIcon={<AddIcon />}
          sx={{
            width: { xs: "100%", sm: "auto" },
            backgroundColor: "brand.main",
            fontSize: "16px",
            fontWeight: 500,
            px: 3,
            py: 1,
            whiteSpace: "nowrap",
            "&:hover": {
              backgroundColor: "brand.dark",
            },
          }}
        >
          New course
        </Button>
      </div>
    </Box>
  );
}

export default ToolbarCourse;
