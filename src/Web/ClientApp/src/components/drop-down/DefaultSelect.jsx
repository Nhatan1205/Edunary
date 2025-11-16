import {
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";

function DefaultSelect({ data, value = [], onChange, defaultLabel = "All" }) {
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "") {
      onChange && onChange([]);
      return;
    }
    const selectedItem = data.find(item => item.value === selectedValue) || null;
    onChange && onChange(selectedItem ? [selectedItem] : []);
  };

  return (
    <FormControl size="small" sx={{ width: "auto", minWidth: "230px" }}>
      <Select
        defaultValue={defaultLabel}
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            sx: {
              mt: 1,
              borderRadius: "8px",
            }
          },
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          MenuListProps: {
            sx: { "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "transparent !important" } },
          },
        }}
        sx={{
          borderRadius: "24px",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#858585" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#858585" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#858585" },
        }}
      >
        {data.map(item => {
          return (
            <MenuItem
              key={item.value}
              value={item.value}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
                <strong>{item.label}</strong>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default DefaultSelect;
