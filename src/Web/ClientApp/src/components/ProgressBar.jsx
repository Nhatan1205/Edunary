import { Box, LinearProgress, Typography } from "@mui/material";

function ProgressBar({ value, label, color = "primary" }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
}

export default ProgressBar;
