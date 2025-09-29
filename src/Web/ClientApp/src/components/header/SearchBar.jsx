import { InputBase, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

const Search = styled("div", {
  shouldForwardProp: (prop) => prop !== "isMobileExpanded",
})(({ theme, isMobileExpanded }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "background.default",
  "&:hover": {
    backgroundColor: "background.muted",
  },
  marginLeft: 0,
  width: "100%",
  ...(isMobileExpanded && {
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "transparent",
    },
  }),
  [theme.breakpoints.up("sm")]: {
    // marginLeft: theme.spacing(1),
    marginLeft: 0,
    width: "100%",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  right: 0,
  zIndex: 1,
}));

const CloseButtonWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  right: theme.spacing(5),
  zIndex: 2,
}));

const StyledInputBase = styled(InputBase, {
  shouldForwardProp: (prop) => prop !== "isMobileExpanded",
})(({ theme, isMobileExpanded }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 2),
    paddingRight: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    "&:focus": {
      border: "1px solid",
      borderColor: theme.palette.brand.main,
      outline: "none",
    },
    ...(isMobileExpanded && {
      paddingRight: `calc(2em + ${theme.spacing(8)})`,
      fontSize: "16px",
      padding: theme.spacing(1.5, 1, 1.5, 2),
    }),
    [theme.breakpoints.up("sm")]: {
      width: "100%",
      // "&:focus": {
      //   width: "55ch",
      // },
    },
  },
}));

function SearchBar({ isMobileExpanded = false, onClose }) {
  return (
    <Search isMobileExpanded={isMobileExpanded}>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      {isMobileExpanded && (
        <CloseButtonWrapper>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "brand.main",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </CloseButtonWrapper>
      )}
      <StyledInputBase
        placeholder="Search for any courses ..."
        inputProps={{ "aria-label": "search" }}
        isMobileExpanded={isMobileExpanded}
      />
    </Search>
  );
}

export default SearchBar;
