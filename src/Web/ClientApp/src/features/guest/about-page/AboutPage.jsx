import { Box, Typography } from "@mui/material";
import { Col, Container, Row } from "reactstrap";
import image1 from "../../../assets/images/about-hero.jpg";
import image2 from "../../../assets/images/careers-hero.jpg";
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
function AboutPage() {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '300px', md: '400px' },
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${image1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            px: 2,
            fontSize: { xs: '1.4rem', md: '2.6rem' }
          }}
        >
          Inspiring discovery through creativity.
        </Typography>
      </Box>

      {/* Content Section */}
      <Container style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.6,
                  color: '#333',
                  fontSize: { xs: '1.1rem', md: '1.4rem' },
                  mb: 2
                }}
              >
                At Edunary, we've seen again and again how the seemingly simple act of creating can be
                a force for growth, change, and discovery in people's lives. We want to inspire and multiply
                the kind of creative exploration that furthers expression, learning and application.
              </Typography>
            </Box>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.7,
                  color: '#555',
                  fontSize: { xs: '1rem', md: '1.2rem' }
                }}
              >
                Edunary is an online learning community with thousands of classes for creative and
                curious people, on topics including illustration, design, photography, video, freelancing,
                and more. On Edunary, members come together to find inspiration and take the next step
                in their creative journey.
              </Typography>
            </Box>
          </Col>
        </Row>
      </Container>
    {/* Empowerment Section */}
      <Container style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <Row className="justify-content-center">
          <Col xs={12}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                mb: 6,
                color: '#333',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              At Edunary, We Empower:
            </Typography>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} sm={6} lg={4} className="mb-5 mb-lg-0">
            <Box sx={{ textAlign: 'center', px: 2 }}>
              <Box sx={{ fontSize: '3rem', mb: 3 }}>
                <TipsAndUpdatesOutlinedIcon sx={{ fontSize: '3rem' }}/>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: '#333',
                  fontSize: { xs: '1.3rem', md: '1.5rem' }
                }}
              >
                Members to
              </Typography>
              <Typography sx={{ mb: 1, color: '#555', fontSize: '1rem' }}>
                Get inspired.
              </Typography>
              <Typography sx={{ mb: 1, color: '#555', fontSize: '1rem' }}>
                Learn new skills.
              </Typography>
              <Typography sx={{ color: '#555', fontSize: '1rem' }}>
                Make discoveries.
              </Typography>
            </Box>
          </Col>

          <Col xs={12} sm={6} lg={4} className="mb-5 mb-lg-0">
            <Box sx={{ textAlign: 'center', px: 2 }}>
              <Box sx={{ fontSize: '3rem', mb: 3 }}>
                <SchoolOutlinedIcon sx={{ fontSize: '3rem' }}/>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: '#333',
                  fontSize: { xs: '1.3rem', md: '1.5rem' }
                }}
              >
                Teachers to
              </Typography>
              <Typography sx={{ mb: 1, color: '#555', fontSize: '1rem' }}>
                Share expertise.
              </Typography>
              <Typography sx={{ mb: 1, color: '#555', fontSize: '1rem' }}>
                Earn money.
              </Typography>
              <Typography sx={{ color: '#555', fontSize: '1rem' }}>
                Give back.
              </Typography>
            </Box>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Box sx={{ textAlign: 'center', px: 2 }}>
              <Box sx={{ fontSize: '3rem', mb: 3 }}>
                <BusinessCenterOutlinedIcon sx={{ fontSize: '3rem' }}/>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: '#333',
                  fontSize: { xs: '1.3rem', md: '1.5rem' }
                }}
              >
                Business to
              </Typography>
              <Typography sx={{ mb: 1, color: '#555', fontSize: '1rem' }}>
                Be curious.
              </Typography>
              <Typography sx={{ mb: 1, color: '#555', fontSize: '1rem' }}>
                Make an impact.
              </Typography>
              <Typography sx={{ color: '#555', fontSize: '1rem' }}>
                Live a full life.
              </Typography>
            </Box>
          </Col>
        </Row>
      </Container>
      <Box
        sx={{
            position: 'relative',
            width: '100%',
            height: { xs: '300px', md: '400px' },
            backgroundImage: `url(${image2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
        }}
        >
        <Container>
        <Typography
            variant="h4"
            sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: { xs: '0.8rem', md: '2rem' },
            mb: 1
            }}
        >
            “At Edunary we’re building a platform that enables everyone with the opportunity
            to be creative. Our core values as an organization are curiosity, transparency,
            impact and community. We keep these values at the heart of everything we do to
            connect our community of teachers, users and employees alike to a clear mission.”
        </Typography>

        <Typography
            variant="h4"
            sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: { xs: '0.5rem', md: '1.2rem' }
            }}
        >
            – An, CEO of Edunary
        </Typography>
        </Container>

        </Box>

    </Box>
  );
}

export default AboutPage
