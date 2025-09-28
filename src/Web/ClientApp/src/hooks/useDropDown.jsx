import { useState } from "react";

function useDropdown() {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return { anchorEl, isOpen, handleOpen, handleClose };
}

export default useDropdown;
