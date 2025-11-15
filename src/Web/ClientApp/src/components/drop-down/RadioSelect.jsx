import {
  Radio,
  FormControl,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";

function RadioSelect({ title, data, value = [], onChange, defaultLabel = "All" }) {
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "") {
      onChange && onChange([]);
      return;
    }
    const selectedItem = data.find(item => item.value === selectedValue) || null;
    onChange && onChange(selectedItem ? [selectedItem] : []);
  };

  const renderValue = (selectedValues) => {
    if (!selectedValues || selectedValues.length === 0) {
      return <span style={{ color: "#666" }}>{title}</span>;
    }
    return <span style={{ color: "#080808", fontWeight: 600 }}>{selectedValues[0].label}</span>;
  };

  return (
    <FormControl size="small" sx={{ width: "auto", minWidth: "100px" }}>
      <Select
        displayEmpty
        value={value[0]?.value || ""}
        onChange={handleChange}
        input={<OutlinedInput placeholder={title} />}
        renderValue={() => renderValue(value)}
        MenuProps={{
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
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
        }}
      >
        {data.map(item => {
          const isSelected = value[0]?.value === item.value;
          return (
            <MenuItem
              key={item.value}
              value={item.value}
              sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: "200px" }}
            >
              <Radio
                checked={isSelected}
                sx={{ p: 0.5, "&.Mui-checked": { color: "brand.main" } }}
              />
              <ListItemText
                primary={item.label}
                sx={{ "& span": { fontSize: "0.9rem" } }}
              />
            </MenuItem>
          );
        })}
        <MenuItem
          value=""
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: "200px" }}
        >
          <Radio
            checked={!value || value.length === 0}
            sx={{ p: 0.5, "&.Mui-checked": { color: "brand.main" } }}
          />
          <ListItemText
            primary={defaultLabel}
            sx={{ "& span": { fontSize: "0.9rem" } }}
          />
        </MenuItem>
      </Select>
    </FormControl>
  );
}

export default RadioSelect;
