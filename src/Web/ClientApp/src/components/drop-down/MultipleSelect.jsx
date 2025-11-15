import {
  Checkbox,
  FormControl,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Box,
  Chip,
} from "@mui/material";

function MultipleSelect({ title, data,value=[], onChange }) {
  const handleChange = (event) => {
    const selectedLabels =
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value;

    const newSelected = data.filter(item => selectedLabels.includes(item.label));
    onChange && onChange(newSelected);
  };

  function renderValue(selectedValues) {
    if (selectedValues.length === 0) {
      return <span style={{ color: "#666" }}>{title}</span>;
    }
    return (
      <Box sx={{ display: "flex", alignItems: "center", fontWeight: 600 }}>
        <span>{title}</span>
        <Chip
          label={selectedValues.length}
          size="small"
          sx={{
            ml: 2,
            height: 20,
            fontSize: "0.75rem",
            fontWeight: 600,
            backgroundColor: "brand.lighter",
            color: "brand.dark",
            borderRadius: "6px",
          }}
        />
      </Box>
    );
  }

  return (
    <FormControl
      size="small"
      sx={{
        width: "auto",
        minWidth: "100px"
      }}
    >
      <Select
        multiple
        displayEmpty
        value={value.map(i => i.label)}
        onChange={handleChange}
        input={<OutlinedInput placeholder={title} />}
        renderValue={renderValue}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          MenuListProps: {
            sx: {
              "& .MuiMenuItem-root.Mui-selected": {
                backgroundColor: "transparent !important",
              },
            }
          }
        }}
        sx={{
          borderRadius: "24px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#858585",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#858585",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "brand.main",
          },
        }}
      >
        {data.map((item) => {
          const isSelected = value.some(v => v.label === item.label);
          return (
            <MenuItem
              key={item.label}
              value={item.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: "200px"
              }}
            >
              <Checkbox
                checked={isSelected}
                sx={{
                  p: 0.5,
                  color: isSelected ? "brand.main" : undefined,
                  "&.Mui-checked": {
                    color: "brand.main",
                  },
                }}
              />
              <ListItemText
                primary={item.label}
                sx={{
                  "& span": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            </MenuItem>
          );
        })}

      </Select>
    </FormControl>
  );
}

export default MultipleSelect;