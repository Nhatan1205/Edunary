import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function IntendedLearnersComparison({ changes }) {
  if (!changes.length) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 600 }}>
          No intended learners fields have been modified.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {changes.map((change, index) => (
        <Box key={index}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            {change.field}
          </Typography>
          <Box sx={{ pl: 2, borderLeft: "2px solid #E5E7EB" }}>
            {change.details?.map((detail, dIdx) => {
              const isAdded = detail.type === "added";
              return (
                <Box key={dIdx} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: isAdded ? "brand.main" : "text.disabled" }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: isAdded ? "text.primary" : "text.secondary",
                      fontWeight: isAdded ? 600 : 400
                    }}
                  >
                    {detail.value} {!isAdded && "(Removed)"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
