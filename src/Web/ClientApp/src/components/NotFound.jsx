import React from 'react';
import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { keyframes } from '@mui/system';

// Define a floating animation for the 404 text
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

function NotFound() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        // Create a subtle gradient background using brand colors
        background: `linear-gradient(135deg, ${theme.palette.brand.lighter} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      {/* Decorative Background Blob 1 (Top Right) */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: theme.palette.secondaryBrand.lighter,
          opacity: 0.3,
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />
      
      {/* Decorative Background Blob 2 (Bottom Left) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '35vw',
          height: '35vw',
          borderRadius: '50%',
          background: theme.palette.brand.light,
          opacity: 0.2,
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        
        {/* The Big 404 Number */}
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '8rem', md: '12rem' },
            color: theme.palette.brand.main,
            lineHeight: 1,
            mb: 0,
            animation: `${float} 6s ease-in-out infinite`,
            textShadow: `0px 10px 30px ${theme.palette.brand.light}66`, // 66 is for hex transparency
            userSelect: 'none',
          }}
        >
          404
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.text.primary,
          }}
        >
          Oops! Page not found.
        </Typography>

        {/* Description Text */}
        <Typography
          variant="body1"
          sx={{
            mb: 5,
            color: theme.palette.text.secondary,
            maxWidth: '500px',
            mx: 'auto',
            fontSize: '1.1rem',
          }}
        >
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>

        {/* Action Buttons */}
        <Box 
            sx={{ 
                display: 'flex', 
                gap: 2, 
                flexWrap: 'wrap', 
                justifyContent: 'center' 
            }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeRoundedIcon />}
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              backgroundColor: theme.palette.brand.main,
              boxShadow: `0 8px 20px ${theme.palette.brand.light}66`,
              '&:hover': {
                backgroundColor: theme.palette.brand.dark,
                boxShadow: `0 10px 25px ${theme.palette.brand.light}88`,
              },
            }}
          >
            Go Home
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              borderWidth: '2px',
              borderColor: theme.palette.text.disabled,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.brand.main,
                color: theme.palette.brand.main,
                borderWidth: '2px',
                backgroundColor: theme.palette.brand.lighter,
              },
            }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default NotFound;