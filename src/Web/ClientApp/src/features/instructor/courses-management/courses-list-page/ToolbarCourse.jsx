import {
  TextField,
  Button,
  InputAdornment,
  Box,
  IconButton,
} from "@mui/material";
import { Link as RouterLink, useSearchParams } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DefaultSelect from "../../../../components/drop-down/DefaultSelect";
import { useState } from "react";

const sortData = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A-Z", value: "titleascending" },
  { label: "Z-A", value: "titledescending" },
  { label: "Published first", value: "publishedfirst" },
  { label: "Unpublished first", value: "unpublishedFirst" },
];

function ToolbarCourse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(() => {
    return decodeURIComponent(searchParams.get("query") || "");
  });
  const sortby = searchParams.getAll("ordering")
    .map(val => sortData.find(item => item.value === val))
    .filter(Boolean);
  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("query");
    if (keyword.trim() !== "") {
      params.append("query", encodeURIComponent(keyword.trim()));
    }
    setSearchParams(params);
  }

  function updateQueryParam(key, selectedItems) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(key);

    if (selectedItems && selectedItems.length > 0) {
      selectedItems.forEach(item => {
        params.append(key, item.value);
      });
    }

    setSearchParams(params);
  };

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
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            size="small"
            placeholder="Search your courses"
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
              "& .MuiOutlinedInput-root": {
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "brand.main",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "brand.main",
                },
              },
            }}
          />

          <IconButton
            onClick={handleSearch}
            size={"medium"}
            aria-label="show cart items"
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

          <DefaultSelect
            data={sortData}
            value={sortby}
            onChange={selected => updateQueryParam('ordering', selected)}
            defaultLabel="Newest"
          />
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
