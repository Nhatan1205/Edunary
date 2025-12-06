import { Box, Typography } from "@mui/material";

function PageTitle({ title,subtitle = "" }) {
  return (
    <Box>
      <Typography variant="h5" fontWeight="550" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
}

export default PageTitle;
