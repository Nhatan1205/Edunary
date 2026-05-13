export const cardSx = {
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
  overflow: "hidden",
}

export const fieldSx = {
  "& label.Mui-focused": { color: "brand.dark" },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "&:hover fieldset": { borderColor: "brand.main" },
    "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
  },
}
