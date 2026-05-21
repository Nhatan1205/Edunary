import { useEffect, useRef, useState } from "react"
import { Alert, Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material"
import { PaymentClient } from "../../../../web-api-client.ts"
import { extractApiError } from "../../../../utils/helpers.js"

export default function BillingAddress({ country, setCountry }) {
  const [regions, setRegions] = useState([])
  const [loadingRegions, setLoadingRegions] = useState(true)
  const [regionError, setRegionError] = useState("")
  const initialCountryRef = useRef(country)
  const setCountryRef = useRef(setCountry)

  useEffect(() => {
    let cancelled = false

    const client = new PaymentClient()
    setRegionError("")
    client.getCheckoutTaxRegions()
      .then((data) => {
        if (cancelled) return
        setRegions(data ?? [])
        if (data?.length && !data.some((r) => r.countryCode === initialCountryRef.current)) {
          setCountryRef.current(data[0].countryCode)
        }
      })
      .catch((error) => {
        if (cancelled) return
        setRegions([])
        setRegionError(
          extractApiError(error) || error?.message || "Failed to load tax regions."
        )
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingRegions(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
        Billing Address
      </Typography>
      {regionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {regionError}
        </Alert>
      )}
      <FormControl fullWidth sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'brand.main' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'brand.main' },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: 'brand.main' },
        '& .MuiMenuItem-root.Mui-selected': { bgcolor: 'brand.lighter' },
        '& .MuiMenuItem-root:hover': { bgcolor: 'background.muted' },
      }}>
        <InputLabel>Country</InputLabel>
        <Select
          value={loadingRegions ? "" : country}
          label="Country"
          onChange={(e) => setCountry(e.target.value)}
          disabled={loadingRegions || Boolean(regionError)}
          startAdornment={loadingRegions ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
          sx={{ bgcolor: "background.paper" }}
        >
          {regions.map((r) => (
            <MenuItem key={r.countryCode} value={r.countryCode}>
              {r.countryName || r.countryCode}
              {r.vatRate > 0 && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (VAT {(r.vatRate * 100).toFixed(0)}%)
                </Typography>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        Edunary is required by law to collect applicable transaction taxes for purchases made in certain tax jurisdictions.
      </Typography>
    </Box>
  )
}
