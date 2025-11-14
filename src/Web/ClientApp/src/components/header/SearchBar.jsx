import { InputBase, IconButton, Popover } from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {useRef, useState } from "react";
import DropDownSearch from "./drop-down-search/DropDownSearch";
import { useNavigate } from "react-router";
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
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function handleInputChange(e){
    const value = e.target.value;
    setSearchValue(value);
    setOpen(value.length > 2);
  };

  function handleEnter(e) {
    if (e.key === "Enter" && searchValue.trim()) {
      navigate(`/course/search?query=${encodeURIComponent(searchValue)}`);
      setOpen(false);
    }
  }

  function handleClosePopover() {
    setOpen(false);
  };

  function handleClear() {
      setSearchValue("");
      setOpen(false)
      if (onClose) onClose();
  };

  return (
  <>
    <Search isMobileExpanded={isMobileExpanded}>
      <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
      {isMobileExpanded && searchValue && (
        <CloseButtonWrapper>
          <IconButton size="small" onClick={handleClear}> <CloseIcon fontSize="small"/> </IconButton>
        </CloseButtonWrapper>
      )}
      <StyledInputBase
        placeholder="Search for any courses ..."
        value={searchValue}
        onChange={handleInputChange}
        inputRef={inputRef}
        onKeyDown={handleEnter}
      />
    </Search>

    <Popover
      open={open}
      anchorEl={inputRef.current}
      onClose={handleClosePopover}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      disableScrollLock
      sx={{
        "& .MuiPopover-paper": {
          pointerEvents: "auto",
          width: inputRef.current?.offsetWidth || "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 2,
          mt: 1,
        },
      }}
    >
      <DropDownSearch searchValue={searchValue} handleClose={handleClear} />
    </Popover>
  </>

  );

}

export default SearchBar;
