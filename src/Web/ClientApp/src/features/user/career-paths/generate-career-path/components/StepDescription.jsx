import { Box, Typography, TextField, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AlertBox from "../../../../../components/AlertBox";

const MAX_LENGTH = 1000;

export default function StepDescription({ value, onChange, onNext }) {
    const isOverLimit = value.length > MAX_LENGTH;
    const isValid = value.trim().length >= 20 && !isOverLimit;

    return (
        <Box sx={{ maxWidth: 640, mx: 'auto', width: '100%', px: 2 }}>
            <Box sx={{ mb: 5, textAlign: 'center' }}>
                <Box
                    sx={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 56, height: 56, borderRadius: '50%',
                        background: (t) => `linear-gradient(135deg, ${t.palette.brand.main} 0%, ${t.palette.brand.light} 100%)`,
                        mb: 3, boxShadow: '0 8px 24px rgba(0,167,111,0.3)',
                    }}
                >
                    <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 28 }} />
                </Box>
                <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5, fontSize: { xs: '1.6rem', md: '2rem' } }}>
                    What do you want to master?
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
                    Describe your career goals, current experience, or the skills you want to build.
                    Our AI will craft a personalized learning path just for you.
                </Typography>
            </Box>

            <TextField
                multiline
                minRows={5}
                maxRows={10}
                fullWidth
                placeholder="e.g. I'm a junior developer wanting to transition into data science. I know Python basics but need to learn ML algorithms, statistics, and model deployment..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        backgroundColor: 'background.surface',
                        '&:hover fieldset': { borderColor: 'brand.main' },
                        '&.Mui-focused fieldset': { borderColor: 'brand.main', borderWidth: 2 },
                    },
                }}
            />
            <Typography
                variant="caption"
                sx={{ color: isOverLimit ? 'error.main' : 'text.secondary', display: 'block', textAlign: 'right' }}
            >
                {value.length} / {MAX_LENGTH} characters
            </Typography>

            {isOverLimit && (
                <AlertBox severity="error" sx={{ mb: 3 }}>
                    Description is too long. Please keep it under {MAX_LENGTH} characters.
                </AlertBox>
            )}

            <Button
                fullWidth
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                disabled={!isValid}
                onClick={onNext}
                sx={{
                    py: 1.75, borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
                    background: isValid
                        ? (t) => `linear-gradient(135deg, ${t.palette.brand.main} 0%, ${t.palette.brand.dark} 100%)`
                        : undefined,
                    boxShadow: isValid ? '0 8px 24px rgba(0,167,111,0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: isValid ? 'translateY(-1px)' : 'none',
                        boxShadow: isValid ? '0 12px 28px rgba(0,167,111,0.4)' : 'none',
                    },
                }}
            >
                Continue
            </Button>
        </Box>
    );
}
