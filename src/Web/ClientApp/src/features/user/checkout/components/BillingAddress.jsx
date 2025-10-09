import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material"

export default function BillingAddress({ country, setCountry }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
        Billing Address
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Country</InputLabel>
        <Select
          value={country}
          label="Country"
          onChange={(e) => setCountry(e.target.value)}
          sx={{ bgcolor: "background.paper" }}
        >
          <MenuItem value="Vietnam">🇻🇳 Vietnam</MenuItem>
          <MenuItem value="United States">🇺🇸 United States</MenuItem>
          <MenuItem value="United Kingdom">🇬🇧 United Kingdom</MenuItem>
          <MenuItem value="Canada">🇨🇦 Canada</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        Edunary is required by law to collect applicable transaction taxes for purchases made in certain tax jurisdictions.
      </Typography>
    </Box>
  )
}