import { Box, Typography } from "@mui/material";

export const GRID_SX = {
  border: "1px solid #e0e0e0",
  borderRadius: 1,
  "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 600,
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    color: "#555",
  },
  "& .MuiDataGrid-cell:focus": { outline: "none" },
  "& .MuiDataGrid-columnHeader:focus": { outline: "none" },
};

export const financeTextFieldSx = {
  backgroundColor: "white",
  "& label.Mui-focused": { color: "brand.dark" },
  "& .MuiOutlinedInput-root": {
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "brand.main",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "brand.main",
    },
  },
};

const financeDateInputSx = (value) => ({
  height: 40,
  px: 1.5,
  borderRadius: "10px",
  border: "1.5px solid",
  borderColor: value ? "brand.main" : "grey.300",
  bgcolor: "grey.50",
  color: value ? "brand.main" : "text.secondary",
  fontSize: "0.8rem",
  fontFamily: "inherit",
  cursor: "pointer",
  outline: "none",
  minWidth: 140,
  "&:focus": { borderColor: "brand.main" },
});

export function fmt(v) {
  return `$${Number(v ?? 0).toFixed(2)}`;
}

function FinanceDateInput({ title, value, onChange }) {
  return (
    <Box
      component="input"
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      title={title}
      sx={financeDateInputSx(value)}
    />
  );
}

export function FinanceDateRange({ from, to, onFromChange, onToChange }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <FinanceDateInput title="From date" value={from} onChange={onFromChange} />
      <Typography variant="caption" sx={{ color: "text.secondary" }}>-</Typography>
      <FinanceDateInput title="To date" value={to} onChange={onToChange} />
    </Box>
  );
}
