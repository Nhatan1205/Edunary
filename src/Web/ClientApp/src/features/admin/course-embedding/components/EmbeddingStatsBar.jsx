import { Box, Grid, Paper, Typography, Skeleton } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";

const statCardSx = {
  borderRadius: "14px",
  p: 2.5,
  display: "flex",
  alignItems: "center",
  gap: 2,
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.05)",
  bgcolor: "#fff",
};

function StatCard({ icon, label, value, color, isLoading }) {
  return (
    <Paper sx={statCardSx} elevation={0}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          bgcolor: color + ".lighter",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {isLoading ? (
          <Skeleton width={48} height={28} />
        ) : (
          <Typography variant="h5" fontWeight={700} color="text.primary">
            {value ?? "—"}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function EmbeddingStatsBar({ syncData, isLoading }) {
  const totalPublic = syncData?.result?.totalPublicCourses ?? 0;
  const embedded = syncData?.result?.totalEmbedded ?? 0;
  const missing  = syncData?.result?.totalMissing ?? 0;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={4}>
        <StatCard
          icon={<StorageOutlinedIcon sx={{ color: "info.main", fontSize: 22 }} />}
          label="Public Courses"
          value={totalPublic}
          color="info"
          isLoading={isLoading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <StatCard
          icon={<AutoAwesomeOutlinedIcon sx={{ color: "success.main", fontSize: 22 }} />}
          label="Embedded"
          value={embedded}
          color="success"
          isLoading={isLoading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <StatCard
          icon={<WarningAmberOutlinedIcon sx={{ color: "warning.main", fontSize: 22 }} />}
          label="Missing Embeddings"
          value={missing}
          color="warning"
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  );
}

export default EmbeddingStatsBar;
