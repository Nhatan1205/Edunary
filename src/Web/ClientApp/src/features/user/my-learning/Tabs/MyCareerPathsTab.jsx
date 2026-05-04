import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Chip, Divider, CircularProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CustomPagination from '../../../../components/pagination/CustomPagination';
import useGetStudentRoadmaps from '../../../../hooks/roadmap-hooks/useGetStudentRoadmaps';



const LEVEL_COLORS = {
    Beginner: { bg: 'success.lighter', color: 'success.dark' },
    Intermediate: { bg: 'info.lighter', color: 'info.dark' },
    Advanced: { bg: 'secondaryBrand.lighter', color: 'secondaryBrand.dark' },
    All: { bg: 'grey.200', color: 'grey.700' },
};

// ── Career path card (row style, matches CareerPathCard reference) ─────────────
function CareerPathCard({ path }) {
    const navigate = useNavigate();
    const level = LEVEL_COLORS[path.level] ?? LEVEL_COLORS.All;
    const formattedDate = new Date(path.created).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });

    return (
        <Box
            onClick={() => navigate(`/user/career-path/${path.id}`)}
            sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                padding: '28px 32px',
                mb: '20px',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': {
                    boxShadow: '0 8px 32px rgba(0,167,111,0.13)',
                    transform: 'translateY(-2px)',
                },
            }}
        >
            {/* Topic chip */}
            <Chip
                label={path.subtitle}
                size="small"
                sx={{
                    bgcolor: 'background.muted',
                    color: 'brand.darker',
                    fontWeight: 600,
                    fontSize: 12,
                    mb: 1.5,
                }}
            />

            {/* Title */}
            <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: 'text.primary', mb: 1.25 }}
            >
                {path.title}
            </Typography>

            {/* Description */}
            <Typography
                variant="body1"
                sx={{
                    color: 'text.tertiary',
                    mb: 2.25,
                    maxWidth: 720,
                    lineHeight: 1.65,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: 'calc(1.65em * 3)',
                }}
            >
                {path.description}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Footer */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label={path.level}
                        size="small"
                        sx={{ bgcolor: level.bg, color: level.color, fontWeight: 700, fontSize: '0.72rem' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.tertiary', fontSize: 13 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption">{formattedDate}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.tertiary', fontSize: 13, fontWeight: 500 }}>
                    <SchoolIcon sx={{ fontSize: 17, color: 'brand.main' }} />
                    <span>{path.nodeCount} courses</span>
                </Box>
            </Box>
        </Box>
    );
}

// ── Tab content ───────────────────────────────────────────────────────────────
export default function MyCareerPathsTab() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 6;

    const { data, isLoading, isError } = useGetStudentRoadmaps({ pageNumber: page, pageSize: PAGE_SIZE });

    const items = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    return (
        <Box>
            {/* Header row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
                        My Career Paths
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        AI-generated personalized learning paths
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => navigate('/user/career-paths')}
                    sx={{
                        borderRadius: '10px', px: 2.5, py: 1.25, fontWeight: 600,
                        background: 'linear-gradient(135deg, #00A76F 0%, #007867 100%)',
                        boxShadow: '0 4px 12px rgba(0,167,111,0.25)',
                        '&:hover': { boxShadow: '0 6px 18px rgba(0,167,111,0.35)', transform: 'translateY(-1px)' },
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Generate New
                </Button>
            </Box>

            {/* Loading */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: 'brand.main' }} />
                </Box>
            )}

            {/* Error */}
            {isError && !isLoading && (
                <Typography sx={{ color: 'error.main', textAlign: 'center', py: 4 }}>
                    Failed to load career paths.
                </Typography>
            )}

            {/* List or empty state */}
            {!isLoading && !isError && (
                items.length === 0 ? (
                    /* Empty state */
                    <Box
                        sx={{
                            textAlign: 'center', py: 10,
                            border: '2px dashed', borderColor: 'grey.200', borderRadius: '16px',
                        }}
                    >
                        <AutoAwesomeIcon sx={{ fontSize: 48, color: 'brand.light', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                            No career paths yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                            Generate your first AI-powered career path to get started.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AutoAwesomeIcon />}
                            onClick={() => navigate('/ai/career-path')}
                            sx={{
                                borderRadius: '10px', px: 3, fontWeight: 600,
                                background: 'linear-gradient(135deg, #00A76F 0%, #007867 100%)',
                            }}
                        >
                            Generate Career Path
                        </Button>
                    </Box>
                ) : (
                    <>
                        {items.map((path) => (
                            <CareerPathCard key={path.id} path={path} />
                        ))}
                        {totalPages > 1 && (
                            <CustomPagination
                                count={totalPages}
                                page={page}
                                onChange={(_, val) => { setPage(val); }}
                            />
                        )}
                    </>
                )
            )}
        </Box>
    );
}
