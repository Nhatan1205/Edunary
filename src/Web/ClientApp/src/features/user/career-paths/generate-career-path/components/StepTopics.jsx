import { useState } from 'react';
import {
    Box, Typography, TextField, Button, Chip,
    InputAdornment, CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import useGetRoadmapTopics from '../../../../../hooks/roadmap-hooks/useGetRoadmapTopics';
import useDebounce from '../../../../../hooks/common/useDebounce';

export default function StepTopics({ selected, onSelect, onBack, onGenerate }) {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);

    const { data, isLoading } = useGetRoadmapTopics({
        searchQuery: debouncedSearch || null,
        pageSize: 16,
    });
    const topics = data?.items ?? [];

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto', width: '100%', px: 2 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5, fontSize: { xs: '1.6rem', md: '2rem' } }}>
                    Pick your focus area
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Select one topic that best matches your career goal.
                </Typography>
            </Box>

            {/* Search bar */}
            <TextField
                fullWidth
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                    ),
                    endAdornment: isLoading ? (
                        <InputAdornment position="end">
                            <CircularProgress size={16} sx={{ color: 'brand.main' }} />
                        </InputAdornment>
                    ) : null,
                }}
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'background.surface',
                        '&:hover fieldset': { borderColor: 'brand.main' },
                        '&.Mui-focused fieldset': { borderColor: 'brand.main' },
                    },
                }}
            />

            {/* Topic cards — single select */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mb: 5, minHeight: 100 }}>
                {isLoading && topics.length === 0 ? (
                    <CircularProgress size={28} sx={{ color: 'brand.main', mt: 3 }} />
                ) : topics.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 3 }}>
                        No topics match your search.
                    </Typography>
                ) : topics.map((topic) => {
                    const active = selected === topic.id;
                    return (
                        <Chip
                            key={topic.id}
                            label={topic.title}
                            onClick={() => onSelect(active ? null : topic.id)}
                            sx={{
                                px: 2,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                minWidth: 90,
                                cursor: 'pointer',
                                borderRadius: '12px',
                                border: '2px solid',
                                borderColor: active ? 'brand.main' : 'grey.300',
                                backgroundColor: active ? 'background.muted' : 'background.paper',
                                color: active ? 'brand.dark' : 'text.secondary',
                                boxShadow: active
                                    ? '0 4px 16px rgba(0,167,111,0.2)'
                                    : '0 2px 8px rgba(0,0,0,0.06)',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                    borderColor: 'brand.main',
                                    backgroundColor: 'background.muted',
                                    color: 'brand.dark',
                                    boxShadow: '0 4px 16px rgba(0,167,111,0.15)',
                                    transform: 'translateY(-1px)',
                                },
                            }}
                        />
                    );
                })}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                    sx={{
                        flex: '0 0 auto', px: 3, py: 1.75, borderRadius: '12px',
                        borderColor: 'grey.300', color: 'text.secondary',
                        '&:hover': { borderColor: 'brand.main', color: 'brand.main' },
                    }}
                >
                    Back
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<AutoAwesomeIcon />}
                    disabled={!selected}
                    onClick={onGenerate}
                    sx={{
                        py: 1.75, borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
                        background: selected
                            ? (t) => `linear-gradient(135deg, ${t.palette.brand.main} 0%, ${t.palette.brand.dark} 100%)`
                            : undefined,
                        boxShadow: selected ? '0 8px 24px rgba(0,167,111,0.3)' : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            transform: selected ? 'translateY(-1px)' : 'none',
                            boxShadow: selected ? '0 12px 28px rgba(0,167,111,0.4)' : 'none',
                        },
                    }}
                >
                    Generate My Career Path
                </Button>
            </Box>
        </Box>
    );
}
