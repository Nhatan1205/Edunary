import { Box, Typography } from "@mui/material";

function PageTitle({ title }) {
  return (
    <Box>
      <Typography variant="h5" fontWeight="550" color="text.primary">
        {title}
      </Typography>
    </Box>
  );
}

export default PageTitle;
