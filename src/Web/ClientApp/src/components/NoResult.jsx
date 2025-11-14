import { Box, Typography } from "@mui/material";


function NoResult({searchValue = "",sx = {}}) {
  return (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: "brand.dark",
        borderRadius: '8px',
        padding: '60px 40px',
        textAlign: 'center',
        ...sx
      }}
    >
      <Typography
        sx={{
          fontSize: '32px',
          fontWeight: 600,
          color: '#000000',
        }}
      >
        Your search for "
        <Box
          component="span"
          sx={{
            color: 'brand.dark',
            fontWeight: 600
          }}
        >
          {searchValue}
        </Box>
        " didn't return any results.
      </Typography>
    </Box>
  );
};

export default NoResult;