import { Box, Typography } from "@mui/material";
import { Container, Row, Col } from "reactstrap";
import useScrollAnimation from "../../../../hooks/common/useScrollAnimation";
import theme from "../../../../theme/theme";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RouteIcon from "@mui/icons-material/Route";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const features = [
  {
    icon: <AccessTimeIcon sx={{ fontSize: 28 }} />,
    title: "Learn at Your Own Pace",
    description:
      "Access courses anytime, anywhere. Learn on your schedule without pressure or deadlines.",
  },
  {
    icon: <RouteIcon sx={{ fontSize: 28 }} />,
    title: "Career-Focused Roadmaps",
    description:
      "Structured learning paths to guide you from beginner to job-ready with clear milestones.",
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 28 }} />,
    title: "Expert Instructors",
    description:
      "Learn from industry professionals with real-world experience at top companies.",
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 28 }} />,
    title: "Earn Certificates",
    description:
      "Get recognized for your achievements with completion certificates to showcase your skills.",
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
    title: "Stay Up-to-Date",
    description:
      "Courses updated regularly with the latest industry trends and best practices.",
  },
];

function WhyChooseUsSection() {
  const titleRef = useScrollAnimation("fade-in-up");
  const gridRef = useScrollAnimation("fade-in-up", { threshold: 0.1 });

  return (
    <Box
      component="section"
      sx={{
        background: "linear-gradient(135deg, #E9FAF7 0%, #EFF7F6 50%, #FCFFFE 100%)",
        py: { xs: 6, md: 8 },
      }}
    >
      <Container>
        {/* Section header */}
        <Box ref={titleRef} sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1.5,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            Why Choose Edunary?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.tertiary",
              fontSize: "1.05rem",
              maxWidth: 500,
              mx: "auto",
            }}
          >
            Everything you need to accelerate your learning journey
          </Typography>
          {/* Animated underline */}
          <span
            className="title-underline"
            style={{ backgroundColor: theme.palette.secondaryBrand.main }}
          />
        </Box>

        {/* Features grid */}
        <Box ref={gridRef}>
          <Row className="g-4 justify-content-center">
            {features.map((feature, index) => (
              <Col xs={12} sm={6} lg={4} key={index}>
                <Box
                  className="feature-card-animated"
                  sx={{
                    display: "flex",
                    gap: 2.5,
                    padding: "24px",
                    borderRadius: "16px",
                    transition: "background-color 0.2s ease, opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                    transitionDelay: `${index * 0.1}s`,
                    height: "100%",
                    "&:hover": {
                      bgcolor: "background.muted",
                    },
                  }}
                >
                  {/* Icon circle */}
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      minWidth: 56,
                      borderRadius: "14px",
                      bgcolor: "brand.lighter",
                      color: "brand.dark",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </Box>

                  {/* Text */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.75,
                        fontSize: "1rem",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.tertiary",
                        lineHeight: 1.6,
                        fontSize: "0.9rem",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </Col>
            ))}
          </Row>
        </Box>
      </Container>
    </Box>
  );
}

export default WhyChooseUsSection;
