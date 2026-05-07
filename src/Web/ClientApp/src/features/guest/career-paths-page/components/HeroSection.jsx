import { Typography, Box, Button } from "@mui/material";
import { Container, Row, Col } from "reactstrap";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Link as RouterLink } from "react-router";

function HeroSection() {
    return (
        <Box
            sx={{
                background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.background.muted} 0%, ${theme.palette.background.surface} 100%)`,
                padding: "56px 0 48px",
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            <Container>
                <Row className="align-items-center">
                    {/* Left text */}
                    <Col md={6} className="mb-4 mb-md-0">
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                bgcolor: "background.paper",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: "20px",
                                px: "14px",
                                py: "4px",
                                mb: 3,
                            }}
                        >
                            <Typography sx={{ fontSize: 14, color: "text.tertiary" }}>
                                🚀 Trusted by 500k+ learners worldwide
                            </Typography>
                        </Box>

                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.2,
                                mb: 1,
                            }}
                        >
                            Self-paced career paths for
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                color: "brand.dark",
                                lineHeight: 1.2,
                                mb: 2.5,
                            }}
                        >
                            tech professionals
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: "text.tertiary",
                                maxWidth: 480,
                                lineHeight: 1.7,
                                mb: 3,
                            }}
                        >
                            Shape your tech career with structured paths crafted by leading
                            experts. Learn today's core skills and tomorrow's fundamentals.
                            Earn industry-recognised credentials and see proven career impact.
                        </Typography>

                        <Button
                            component={RouterLink}
                            to="/ai/career-path"
                            variant="outlined"
                            size="small"
                            startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                borderColor: "brand.main",
                                color: "brand.dark",
                                fontWeight: 600,
                                fontSize: 13,
                                borderRadius: "8px",
                                textTransform: "none",
                                px: 2.5,
                                py: 0.9,
                                "&:hover": {
                                    borderColor: "brand.darker",
                                    bgcolor: "background.muted",
                                },
                            }}
                        >
                            Generate my own with AI
                        </Button>
                    </Col>

                    {/* Right illustration */}
                    <Col md={6} className="d-flex justify-content-center">
                        <Box sx={{ position: "relative", width: "100%", maxWidth: 460 }}>
                            <img
                                src={require("../../../../assets/images/CareerPath.png")}
                                alt="Career paths illustration"
                                style={{ width: "100%", objectFit: "contain", maxHeight: 320 }}
                            />
                        </Box>
                    </Col>
                </Row>
            </Container>
        </Box>
    );
}

export default HeroSection;