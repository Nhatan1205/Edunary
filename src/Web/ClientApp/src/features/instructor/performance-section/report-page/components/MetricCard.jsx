import { Box, Paper, Stack, Typography } from "@mui/material";

export default function MetricCard({ label, value, helper, color, Icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 2.25,
        border: "1px solid",
        borderColor: `${color}22`,
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        boxShadow: "0 1px 4px rgba(16, 24, 40, 0.06)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 10px 20px rgba(16, 24, 40, 0.09)",
          borderColor: `${color}44`,
        },
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${color}14`,
            color,
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              mb: 0.5,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "text.primary",
            }}
          >
            {value}
          </Typography>
          {helper && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {helper}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
