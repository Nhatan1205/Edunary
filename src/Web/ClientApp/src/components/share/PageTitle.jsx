import { Box, Typography } from "@mui/material";

function PageTitle({ title }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" fontWeight="600" color="text.primary">
        {title}
      </Typography>
    </Box>
  );
}

export default PageTitle;
