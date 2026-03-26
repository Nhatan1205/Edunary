import { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { Box, Typography } from "@mui/material";
import HeroSection from "./components/HeroSection";
import CareerPathCard from "./components/CareerPathCard";

const TOPICS = [
  "Web Development",
  "Data Science",
  "Machine Learning",
  "Cybersecurity",
  "Cloud Computing",
  "Mobile Development",
  "UI/UX Design",
  "DevOps",
];

const CAREER_PATHS = [
  {
    id: 1,
    topic: "Web Development",
    title: "Full-Stack Web Developer",
    description:
      "Master modern web development with HTML, CSS, JavaScript, React, and Node.js. Build complete, production-ready applications from frontend to backend and become a sought-after full-stack engineer.",
    units: 34,
    creatorName: "Prof. Nguyen Van An",
    creatorAvatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 2,
    topic: "Data Science",
    title: "Data Scientist",
    description:
      "Develop expertise in data analysis, statistical modelling, and machine learning. Learn Python, pandas, scikit-learn, and visualization tools to extract insights that drive business decisions.",
    units: 28,
    creatorName: "Dr. Le Thi Bich",
    creatorAvatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: 3,
    topic: "Machine Learning",
    title: "Machine Learning Engineer",
    description:
      "Go deep into supervised and unsupervised learning, neural networks, and deep learning frameworks. Deploy scalable ML models and build intelligent systems that solve real-world problems.",
    units: 32,
    creatorName: "Dr. Tran Minh Khoa",
    creatorAvatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: 4,
    topic: "Cybersecurity",
    title: "Cybersecurity Analyst",
    description:
      "Learn to identify, prevent, and respond to cybersecurity threats. Cover network security, ethical hacking, penetration testing, and incident response to protect organisations at scale.",
    units: 26,
    creatorName: "Prof. Pham Duc Hung",
    creatorAvatar: "https://i.pravatar.cc/150?img=60",
  },
  {
    id: 5,
    topic: "Cloud Computing",
    title: "Cloud Solutions Architect",
    description:
      "Master cloud infrastructure design with AWS, Azure, and GCP. Learn containerisation with Docker & Kubernetes, serverless architectures, and best practices for scalable cloud deployments.",
    units: 30,
    creatorName: "Eng. Vo Quoc Bao",
    creatorAvatar: "https://i.pravatar.cc/150?img=22",
  },
  {
    id: 6,
    topic: "Mobile Development",
    title: "Mobile App Developer",
    description:
      "Build cross-platform mobile applications using React Native and Flutter. Understand mobile UX patterns, device APIs, app store deployment, and performance optimisation techniques.",
    units: 24,
    creatorName: "Ms. Nguyen Thi Thu",
    creatorAvatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 7,
    topic: "UI/UX Design",
    title: "UI/UX Designer",
    description:
      "Create user-centric digital experiences through design thinking, wireframing, prototyping, and usability testing. Master Figma and build a portfolio that stands out to employers.",
    units: 22,
    creatorName: "Ms. Dang Bich Ngoc",
    creatorAvatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    id: 8,
    topic: "DevOps",
    title: "DevOps Engineer",
    description:
      "Bridge development and operations with CI/CD pipelines, infrastructure as code, monitoring, and automation. Become proficient with Jenkins, Terraform, Prometheus, and modern DevOps toolchains.",
    units: 27,
    creatorName: "Eng. Hoang Van Duc",
    creatorAvatar: "https://i.pravatar.cc/150?img=51",
  },
];


export default function CareerPathPage() {
  const [activeTopic, setActiveTopic] = useState(null);

  const filtered = activeTopic
    ? CAREER_PATHS.filter((p) => p.topic === activeTopic)
    : CAREER_PATHS;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <HeroSection />

      <Container style={{ paddingTop: 48, paddingBottom: 64 }}>
        <Row>
          {/* Sidebar – Topics */}
          <Col md={3} lg={2} className="mb-4 mb-md-0">
            <Box
              sx={{
                position: "sticky",
                top: 100,
                bgcolor: "background.paper",
                padding: "20px 16px",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 1.75,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  fontSize: 11,
                }}
              >
                Topics
              </Typography>
              {TOPICS.map((topic) => (
                <Box
                  key={topic}
                  onClick={() =>
                    setActiveTopic((prev) => (prev === topic ? null : topic))
                  }
                  sx={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    mb: 0.25,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: activeTopic === topic ? 700 : 400,
                    color: activeTopic === topic ? "brand.darker" : "text.secondary",
                    bgcolor: activeTopic === topic ? "background.muted" : "transparent",
                    transition: "all 0.15s",
                    "&:hover": activeTopic !== topic
                      ? { bgcolor: "background.alt" }
                      : {},
                  }}
                >
                  {topic}
                </Box>
              ))}
            </Box>
          </Col>

          {/* Cards */}
          <Col md={9} lg={10}>
            {filtered.length === 0 ? (
              <Typography sx={{ color: "text.tertiary", mt: 3 }}>
                No career paths found for this topic.
              </Typography>
            ) : (
              filtered.map((path) => (
                <CareerPathCard key={path.id} path={path} />
              ))
            )}
          </Col>
        </Row>
      </Container>
    </Box>
  );
}
