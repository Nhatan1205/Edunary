import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Chip, Button, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CareerPathFlow from '../../guest/career-paths-overview-page/components/CareerPathFlow';
import { graphResponseToReactFlow } from '../../../utils/helpers';

// ── Mock data (enriched RoadmapGraphResponse format) ─────────────────────────
const MOCK_ROADMAP = {
    id: 1,
    title: 'Data Science Career Path',
    subtitle: 'Personalized Intermediate path · Data Science',
    description:
        'A carefully curated learning path designed for junior developers transitioning into data science. Covers Python fundamentals, statistical thinking, machine learning algorithms, and model deployment — all sequenced to maximize learning efficiency based on your current skill level and career goals.',
    level: 'Intermediate',
    topicTitle: 'Data Science',
    created: '2025-05-03T14:00:00Z',
    nodeCount: 3,
    graphData: {
        nodes: [
            {
                clientNodeId: 'n1', positionX: 250, positionY: 0, sortOrder: 1,
                course: { courseId: 1, title: 'Python for Data Science', imageUrl: '', totalStudents: 1200, ratings: 4.7 },
            },
            {
                clientNodeId: 'n2', positionX: 150, positionY: 430, sortOrder: 2,
                course: { courseId: 2, title: 'Statistics & Probability', imageUrl: '', totalStudents: 870, ratings: 4.5 },
            },
            {
                clientNodeId: 'n3', positionX: 350, positionY: 860, sortOrder: 3,
                course: { courseId: 3, title: 'Machine Learning A-Z', imageUrl: '', totalStudents: 2300, ratings: 4.8 },
            },
        ],
        edges: [
            { sourceNodeId: 'n1', targetNodeId: 'n2' },
            { sourceNodeId: 'n2', targetNodeId: 'n3' },
        ],
    },
};

// ── Main page ────────────────────────────────────────────────────────────────
export default function MyCareerPathDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const roadmap = MOCK_ROADMAP;

    const { nodes, edges } = useMemo(() => {
        if (!roadmap?.graphData) return { nodes: [], edges: [] };
        return graphResponseToReactFlow(roadmap.graphData);
    }, [roadmap]);

    // Measure the floating card height so the roadmap section
    // can add exactly enough top padding to avoid hiding content.
    const cardRef = useRef(null);
    const [cardHeight, setCardHeight] = useState(200);

    useLayoutEffect(() => {
        if (cardRef.current) {
            setCardHeight(cardRef.current.offsetHeight);
        }
    }, [roadmap]);

    // How much of the card overlaps into the roadmap section.
    // On mobile we skip the overlap to keep things simple.
    const OVERLAP = isMobile ? 0 : Math.round(cardHeight * 0.5);

    const formattedDate = new Date(roadmap.created).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Box
                sx={{
                    position: 'relative',
                    // Extra bottom padding = overlap amount so the card doesn't
                    // squash the gradient background
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

                        // On desktop: center horizontally + push half-height down
                        transform: {
                            xs: 'none',
                            sm: `translateX(-50%) translateY(${OVERLAP}px)`,
                        },

                        // Width
                        width: { xs: '100%', sm: 'calc(100% - 96px)' },
                        maxWidth: 900,

                        // On mobile it's in normal flow, add top margin
                        mt: { xs: 3, sm: 0 },
                        mx: { xs: 2, sm: 'auto' },

                        // Card styling
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        p: { xs: 3, md: 4 },
                        zIndex: 10,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Badges row: topic + level */}
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
                        )}
                        <Chip
                            label={roadmap.level}
                            size="small"
                            sx={{ bgcolor: 'info.lighter', color: 'info.dark', fontWeight: 700, fontSize: '0.72rem' }}
                        />
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: 'text.primary', mb: 1, lineHeight: 1.25, fontSize: { xs: '1.4rem', md: '1.75rem' } }}
                    >
                        {roadmap.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                        variant="body1"
                        sx={{ color: 'text.secondary', lineHeight: 1.75, mb: 2.5 }}
                    >
                        {roadmap.description}
                    </Typography>

                    {/* Meta row */}
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
