import { Box } from '@mui/material'
import { Container } from 'reactstrap'
import CareerPathHero from './components/CareerPathHero'
import CareerPathStats from './components/CareerPathStats'
import CareerPathAbout from './components/CareerPathAbout'
import CareerPathFlow from './components/CareerPathFlow'

// Mock data – replace with real API data when available
const mockCareerPath = {
    title: 'Product Designer',
    description:
        'Master product design with design thinking, AI, user research, and prototyping skills. Become job-ready with professional certification that shows employers you can create products people love.',
    learnersCount: '4.5k',
    rating: '4.7',
    totalRatings: '1.9k',
    skillLevel: 'Beginner',
    duration: '3 months',
    testimonials: [
        { name: 'Timothy', text: 'This is my favorite way to learn and refresh design principles' },
        { name: 'Breiana', text: 'My career transition went completely smooth with this platform' },
    ],
    objectives: [
        'Understand core product design principles and thinking',
        'Apply user research methods to real-world problems',
        'Create wireframes, prototypes, and full design systems',
        'Use AI tools to speed up your design workflow',
        'Build a professional portfolio ready for job applications',
        'Earn a professional certification recognized by top companies',
    ],
}

const CareerPathOverviewPage = () => {
    // TODO: Replace mockCareerPath with useGetCareerPathById(id) hook
    const careerPath = mockCareerPath

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container>
                <CareerPathHero careerPath={careerPath} />
                <CareerPathStats careerPath={careerPath} />
                <CareerPathAbout careerPath={careerPath} />
                <CareerPathFlow />
            </Container>
        </Box>
    )
}

export default CareerPathOverviewPage
