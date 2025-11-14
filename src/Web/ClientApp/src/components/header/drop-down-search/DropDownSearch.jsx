import SearchIcon from "@mui/icons-material/Search";
import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

function DropDownSearch({ searchValue, handleClose }) {
  return (
    <Box sx={{ py: 2, px: 1 }}>
        <Box
            component={RouterLink}
            to={{
                pathname: "/course/search",
                search: `?query=${encodeURIComponent(searchValue)}`
            }}
            onClick={handleClose}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2,
                py: 1.5,
                textDecoration: "none",
                "&:hover": {
                bgcolor: "#EDEFF0",
                },
            }}
        >
            <SearchIcon sx={{ color: "text.primary", fontSize: 20 }} />
            <Typography variant="body1" sx={{ color: "text.primary" }}>
                Search for <strong>"{searchValue}"</strong>
            </Typography>
        </Box>
    </Box>
  );
}

export default DropDownSearch;
