import { Box, Divider, Typography } from "@mui/material"

export default function SectionHeader({ icon, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Box sx={{
        width: 24,
        height: 24,
        borderRadius: "6px",
        bgcolor: "brand.lighter",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, lineHeight: 1 }}>
        {label}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  )
}
