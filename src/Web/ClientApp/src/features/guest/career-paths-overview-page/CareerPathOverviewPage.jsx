import { useParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { Container } from 'reactstrap'
import CareerPathHero from './components/CareerPathHero'
import CareerPathStats from './components/CareerPathStats'
import CareerPathAbout from './components/CareerPathAbout'
import CareerPathFlow from './components/CareerPathFlow'
import useGetPublicRoadmapDetail from '../../../hooks/roadmap-hooks/useGetPublicRoadmapDetail'
import { graphResponseToReactFlow } from '../../../utils/helpers'
import { useMemo } from 'react'

const CareerPathOverviewPage = () => {
    const { id } = useParams()
    const numericId = id ? Number(id) : undefined

    const { data: roadmap, isLoading, isError } = useGetPublicRoadmapDetail(numericId)

    const { nodes, edges } = useMemo(() => {
        if (!roadmap?.graphData) return { nodes: [], edges: [] }
        return graphResponseToReactFlow(roadmap.graphData)
    }, [roadmap])

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: 'brand.main' }} />
            </Box>
        )
    }

    if (isError || !roadmap) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                    Career path not found.
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ bgcolor: 'background.alt', minHeight: '100vh', py: 4 }}>
            <Container>
                {/* Elevated card: Hero + Stats + About */}
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 4,
                        px: { xs: 2, md: 4 },
                        pb: 4,
                        mb: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
                        transition: 'box-shadow 0.2s ease',
                    }}
                >
                    <CareerPathHero careerPath={roadmap} />
                    <CareerPathStats careerPath={roadmap} />
                    <CareerPathAbout careerPath={roadmap} />
                </Box>

                <CareerPathFlow nodes={nodes} edges={edges} />
            </Container>
        </Box>
    )
}

export default CareerPathOverviewPage
