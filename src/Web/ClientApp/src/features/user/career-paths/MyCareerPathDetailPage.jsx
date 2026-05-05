import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Chip, Button, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CareerPathFlow from '../../guest/career-paths-overview-page/components/CareerPathFlow';
import { graphResponseToReactFlow } from '../../../utils/helpers';
import useGetStudentRoadmapDetail from '../../../hooks/roadmap-hooks/useGetStudentRoadmapDetail';

export default function MyCareerPathDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { data: roadmap, isLoading, isError } = useGetStudentRoadmapDetail(id ? Number(id) : undefined);

    // graphData may be a JSON string (backend serializes it)
    const parsedGraphData = useMemo(() => {
        if (!roadmap?.graphData) return null;
        if (typeof roadmap.graphData === 'string') {
            try { return JSON.parse(roadmap.graphData); } catch { return null; }
        }
        return roadmap.graphData;
    }, [roadmap]);

    const { nodes, edges } = useMemo(() => {
        if (!parsedGraphData) return { nodes: [], edges: [] };
        return graphResponseToReactFlow(parsedGraphData);
    }, [parsedGraphData]);

    const cardRef = useRef(null);
    const [cardHeight, setCardHeight] = useState(200);

    useLayoutEffect(() => {
        if (cardRef.current) {
            setCardHeight(cardRef.current.offsetHeight);
        }
    }, [roadmap]);

    const OVERLAP = isMobile ? 0 : Math.round(cardHeight * 0.5);

    const formattedDate = roadmap?.created
        ? new Date(roadmap.created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !roadmap) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" color="text.secondary">Career path not found.</Typography>
                <Button variant="outlined" onClick={() => navigate('/my-learning')}>Back to My Learning</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Box
                sx={{
                    position: 'relative',
                    pb: `${OVERLAP + 36}px`,
                    background: (t) =>
                        `linear-gradient(135deg, ${t.palette.brand.dark} 0%, ${t.palette.brand.main} 100%)`,
                }}
            >
                {/* Back button */}
                <Box sx={{ px: { xs: 2, md: 6 }, pt: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/my-learning')}
                        sx={{
                            color: 'rgba(255,255,255,0.8)', px: 0, fontWeight: 600,
                            '&:hover': { color: '#fff', bgcolor: 'transparent' },
                        }}
                    >
                        My Learning
                    </Button>
                </Box>

                <Box
                    ref={cardRef}
                    sx={{
                        position: { xs: 'relative', sm: 'absolute' },
                        bottom: { xs: 'auto', sm: 0 },
                        left: { xs: 'auto', sm: '50%' },
                        transform: {
                            xs: 'none',
                            sm: `translateX(-50%) translateY(${OVERLAP}px)`,
                        },
                        width: { xs: '100%', sm: 'calc(100% - 96px)' },
                        maxWidth: 900,
                        mt: { xs: 3, sm: 0 },
                        mx: { xs: 2, sm: 'auto' },
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        p: { xs: 3, md: 4 },
                        zIndex: 10,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Badges */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {roadmap.topicTitle && (
                            <Chip
                                label={roadmap.topicTitle}
                                size="small"
                                sx={{
                                    bgcolor: 'background.muted', color: 'brand.darker',
                                    fontWeight: 600, fontSize: '0.72rem',
                                    border: '1px solid', borderColor: 'brand.lighter',
                                }}
                            />
                        )}<Chip
                            label={roadmap.level}
                            size="small"
                            sx={{ bgcolor: 'info.lighter', color: 'info.dark', fontWeight: 700, fontSize: '0.72rem' }}
                        />
                    </Box>

                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: 'text.primary', mb: 1, lineHeight: 1.25, fontSize: { xs: '1.4rem', md: '1.75rem' } }}
                    >
                        {roadmap.title}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{ color: 'text.secondary', lineHeight: 1.75, mb: 2.5 }}
                    >
                        {roadmap.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                            <SchoolIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{roadmap.nodeCount} courses</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                            <CalendarTodayIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Generated {formattedDate}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    pt: { xs: 4, sm: `${OVERLAP + 48}px` },
                    px: { xs: 2, md: 6 },
                    bgcolor: 'background.alt',
                    minHeight: '60vh',
                }}
            >
                <CareerPathFlow nodes={nodes} edges={edges} />
            </Box>
        </Box>
    );
}
