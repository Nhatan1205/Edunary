import React from 'react'
import { Box, Typography } from '@mui/material'

function Archived() {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h4" color="text.secondary">
        Coming Soon
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        Archived content will be available soon.
      </Typography>
    </Box>
  )
}

export default Archived