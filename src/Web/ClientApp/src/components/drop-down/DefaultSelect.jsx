import { FormControl, MenuItem, Select } from "@mui/material";

function DefaultSelect({ data, value = [], onChange, defaultLabel = "All" }) {
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    const selectedItem = data.find(item => item.value === selectedValue) || null;
    onChange && onChange(selectedItem ? [selectedItem] : []);
  };

  return (
    <FormControl size="small" sx={{ width: "auto", minWidth: "230px" }}>
      <Select
        value={value[0]?.value || ""}
        onChange={handleChange}
        displayEmpty
        renderValue={() => value[0]?.label || defaultLabel}
        MenuProps={{
          // disablePortal: true,
          PaperProps: { sx: { mt: 1, borderRadius: "8px",maxHeight: 600 } },
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          MenuListProps: { sx: { "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "transparent !important" } } },
        }}
        sx={{
          borderRadius: "6px",
          minWidth: 100, 
          fontSize: '0.9rem',
          color: 'brand.dark',
          fontWeight: 600,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
        }}
      >
        {data.map(item => (
          <MenuItem
            key={item.value}
            value={item.value}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default DefaultSelect;
