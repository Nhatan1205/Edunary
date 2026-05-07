import { Box, Typography, LinearProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function LoadingScreen({ progress, stepLabel, done }) {
    return (
        <Box
            sx={{
                maxWidth: 520, mx: 'auto', width: '100%', px: 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                animation: 'fadeInUp 0.4s ease both',
                '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
            }}
        >
            {/* Orbital spinner */}
            <Box sx={{ position: 'relative', width: 120, height: 120, mb: 5 }}>
                <Box sx={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: 'brand.main', borderRightColor: 'brand.light',
                    animation: 'spin 1.2s linear infinite',
                    '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                }} />
                <Box sx={{
                    position: 'absolute', inset: 14, borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: 'secondaryBrand.light',
                    animation: 'spin 0.8s linear infinite reverse',
                }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done
                        ? <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'brand.main', animation: 'popIn 0.3s ease both', '@keyframes popIn': { from: { transform: 'scale(0)' }, to: { transform: 'scale(1)' } } }} />
                        : <AutoAwesomeIcon sx={{ fontSize: 32, color: 'brand.main', animation: 'pulse 2s ease infinite', '@keyframes pulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.6, transform: 'scale(0.9)' } } }} />
                    }
                </Box>
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, textAlign: 'center' }}>
                {done ? 'Your career path is ready!' : 'Building your career path...'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center', minHeight: 28, transition: 'opacity 0.3s ease' }}>
                {stepLabel}
            </Typography>

            <Box sx={{ width: '100%', mb: 1.5 }}>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 8, borderRadius: 4,
                        backgroundColor: 'background.muted',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: (t) => `linear-gradient(90deg, ${t.palette.brand.main} 0%, ${t.palette.brand.light} 100%)`,
                            transition: 'transform 0.8s ease',
                        },
                    }}
                />
            </Box>
            <Typography variant="caption" sx={{ color: 'brand.main', fontWeight: 700, alignSelf: 'flex-end' }}>
                {progress}%
            </Typography>

            {!done && (
                <Box sx={{ display: 'flex', gap: 1, mt: 4 }}>
                    {[0, 1, 2].map((i) => (
                        <Box key={i} sx={{
                            width: 8, height: 8, borderRadius: '50%', backgroundColor: 'brand.light',
                            animation: `bounce 1.2s ease ${i * 0.2}s infinite`,
                            '@keyframes bounce': {
                                '0%,100%': { transform: 'translateY(0)', opacity: 0.4 },
                                '50%': { transform: 'translateY(-8px)', opacity: 1 },
                            },
                        }} />
                    ))}
                </Box>
            )}
        </Box>
    );
}
