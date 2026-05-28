import { Box, Typography } from "@mui/material";

export const financePageContainerSx = {
  px: { xs: 0, sm: 1, md: "40px", lg: "120px", xl: "240px" },
  minWidth: 0,
};

export const financeTableCardSx = {
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
  overflow: "hidden",
};

export const financeTableGridSx = {
  border: "none",
  "& .MuiDataGrid-columnHeaders": {
    bgcolor: "#F3F4F6",
    borderBottom: "1px solid #E5E7EB",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 600,
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#6B7280",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: "1px solid #F3F4F6",
    py: 0.5,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-row:hover": {
    bgcolor: "#F9FAFB",
  },
};

export const financePaginationSx = {
  borderTop: "1px solid #F3F4F6",
  "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
    fontSize: "0.8rem",
    color: "#6B7280",
    mb: 0,
  },
  "& .MuiTablePagination-select": { fontSize: "0.8rem" },
};

export const financeToolbarInputSx = {
  height: 40,
  px: 1.5,
  borderRadius: "10px",
  border: "1.5px solid",
  borderColor: "grey.300",
  bgcolor: "grey.50",
  color: "text.primary",
  fontSize: "0.8rem",
  fontFamily: "inherit",
  outline: "none",
  minWidth: 0,
  "&::placeholder": { color: "text.secondary", opacity: 1 },
  "&:hover": { borderColor: "grey.400" },
  "&:focus": { borderColor: "brand.main" },
};

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
  width: { xs: "100%", sm: "auto" },
  minWidth: { xs: 0, sm: 140 },
  flex: { xs: "1 1 100%", sm: "0 0 auto" },
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
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 0.75, sm: 1 },
        flexWrap: "wrap",
        width: { xs: "100%", sm: "auto" },
        minWidth: 0,
      }}
    >
      <FinanceDateInput title="From date" value={from} onChange={onFromChange} />
      <Typography variant="caption" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>-</Typography>
      <FinanceDateInput title="To date" value={to} onChange={onToChange} />
    </Box>
  );
}
