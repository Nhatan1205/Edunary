import { Box, Typography } from "@mui/material";

function PageTitle({ title,subtitle = "" }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" fontWeight="550" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
}

export default PageTitle;
