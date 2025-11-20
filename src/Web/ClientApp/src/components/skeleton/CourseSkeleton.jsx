import { Skeleton, Box } from '@mui/material';

function CourseSkeleton({ height = 400 }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 540,
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height={height / 2}
        animation="wave"
        sx={{ bgcolor: 'grey.300' }}
      />
      <Box
        sx={{
          height: height / 2,
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
        }}
      >
        <Skeleton
          variant="rectangular"
          width="70%"
          height={30}
          animation="wave"
          sx={{ bgcolor: 'grey.300', marginBottom: 2 }}
        />

        <Skeleton
          variant="rectangular"
          width="75%"
          height={30}
          animation="wave"
          sx={{ bgcolor: 'grey.300' }}
        />
      </Box>
    </Box>
  );
}

export default CourseSkeleton;
