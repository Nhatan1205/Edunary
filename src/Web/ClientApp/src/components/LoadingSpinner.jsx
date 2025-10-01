import { Box, CircularProgress, keyframes } from '@mui/material';

// Pulse animation for the rings
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
`;

// Rotation animation
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Glow animation
const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(63, 204, 178, 0.4), 0 0 40px rgba(73, 187, 189, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(63, 204, 178, 0.6), 0 0 60px rgba(73, 187, 189, 0.5);
  }
`;

function LoadingSpinner({ size = 60, fullScreen = false, message = '' }) {
  const spinner = (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer pulsing ring */}
      <Box
        sx={{
          position: 'absolute',
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: '50%',
          border: '3px solid',
          borderColor: 'brand.lighter',
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      />
      
      {/* Middle pulsing ring */}
      <Box
        sx={{
          position: 'absolute',
          width: size * 1.2,
          height: size * 1.2,
          borderRadius: '50%',
          border: '3px solid',
          borderColor: 'brand.light',
          animation: `${pulse} 2s ease-in-out infinite 0.3s`,
        }}
      />

      {/* Main spinner with gradient */}
      <CircularProgress
        size={size}
        thickness={4}
        sx={{
          color: 'brand.main',
          position: 'relative',
          zIndex: 1,
          animation: `${glow} 2s ease-in-out infinite`,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />

      {/* Center dot */}
      <Box
        sx={{
          position: 'absolute',
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3FCCB2 0%, #49BBBD 100%)',
          animation: `${rotate} 3s linear infinite, ${glow} 2s ease-in-out infinite`,
          boxShadow: '0 0 20px rgba(63, 204, 178, 0.6)',
        }}
      />

      {/* Optional message */}
      {message && (
        <Box
          sx={{
            position: 'absolute',
            top: '120%',
            whiteSpace: 'nowrap',
            color: 'text.primary',
            fontWeight: 600,
            fontSize: '0.9rem',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          {message}
        </Box>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(247, 251, 250, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          gap: 3,
        }}
      >
        {spinner}
      </Box>
    );
  }

  return spinner;
}

export default LoadingSpinner;
