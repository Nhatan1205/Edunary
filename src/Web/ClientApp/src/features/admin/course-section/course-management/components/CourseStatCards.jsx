import { Grid, Card, Box, Typography } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import DraftsIcon from "@mui/icons-material/Drafts";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";

const cardSx = {
  p: 3,
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
  display: "flex",
  alignItems: "center",
};

export default function CourseStatCards({ stats, isLoading }) {
  const cards = [
    {
      title: "Public Courses",
      value: stats?.totalPublic ?? 0,
      icon: <PublicIcon sx={{ fontSize: 28, color: "brand.main" }} />,
      color: "brand.lighter",
    },
    {
      title: "Private Courses",
      value: stats?.totalPrivate ?? 0,
      icon: <LockIcon sx={{ fontSize: 28, color: "secondaryBrand.main" }} />,
      color: "secondaryBrand.lighter",
    },
    {
      title: "Draft Courses",
      value: stats?.totalDraft ?? 0,
      icon: <DraftsIcon sx={{ fontSize: 28, color: "info.main" }} />,
      color: "info.lighter",
    },
    {
      title: "Modified Courses",
      value: stats?.totalModified ?? 0,
      icon: <EditCalendarIcon sx={{ fontSize: 28, color: "warning.main" }} />,
      color: "warning.lighter",
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, idx) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
          <Card sx={cardSx}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: "12px",
                bgcolor: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
              }}
            >
              {card.icon}
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                {card.title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                {isLoading ? "..." : card.value}
              </Typography>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
