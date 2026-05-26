import { CircularProgress, Paper, Stack, Typography } from "@mui/material";

export default function ReportLoadingState() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 340,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading report data...
        </Typography>
      </Stack>
    </Paper>
  );
}
