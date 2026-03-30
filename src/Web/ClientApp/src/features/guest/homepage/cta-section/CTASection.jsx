import { Box, Typography, Button } from "@mui/material";
import { Container } from "reactstrap";
import { Link as RouterLink } from "react-router";
import useScrollAnimation from "../../../../hooks/common/useScrollAnimation";

function CTASection() {
  const sectionRef = useScrollAnimation("fade-in-up", { threshold: 0.2 });

  return (
    <Box
      component="section"
      ref={sectionRef}
      sx={{
        background: "linear-gradient(135deg, #3FCCB2 0%, #00b190 50%, #009272 100%)",
        py: { xs: 7, md: 10 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Large blurred blobs */}
      <Box
        className="blob-drift-1"
        sx={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <Box
        className="blob-drift-2"
        sx={{
          position: "absolute",
          bottom: "-20%",
          right: "-8%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <Box
        className="blob-drift-1"
        sx={{
          position: "absolute",
          top: "20%",
          right: "5%",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          filter: "blur(35px)",
          pointerEvents: "none",
        }}
      />

      {/* Small floating dots */}
      {[
        { color: "rgba(255,255,255,0.25)", size: 12, top: "15%", left: "8%", delay: "0s" },
        { color: "rgba(255,255,255,0.18)", size: 16, top: "25%", right: "12%", delay: "1s" },
        { color: "rgba(255,255,255,0.22)", size: 10, bottom: "20%", left: "15%", delay: "2s" },
        { color: "rgba(255,255,255,0.15)", size: 14, bottom: "30%", right: "6%", delay: "0.5s" },
        { color: "rgba(255,255,255,0.20)", size: 8, top: "60%", left: "5%", delay: "1.5s" },
        { color: "rgba(255,255,255,0.12)", size: 18, top: "10%", right: "25%", delay: "2.5s" },
      ].map((dot, i) => (
        <Box
          key={i}
          className="float-y"
          sx={{
            position: "absolute",
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            bgcolor: dot.color,
            top: dot.top,
            bottom: dot.bottom,
            left: dot.left,
            right: dot.right,
            animationDelay: dot.delay,
            pointerEvents: "none",
            display: { xs: "none", sm: "block" },
          }}
        />
      ))}

      <Container>
        <Box
          sx={{
            textAlign: "center",
            maxWidth: 600,
            mx: "auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "text.inverse",
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
              lineHeight: 1.2,
            }}
          >
            Ready to Start Your Learning Journey?
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.inverse",
              opacity: 0.9,
              mb: 4,
              fontSize: { xs: "1rem", md: "1.15rem" },
              lineHeight: 1.6,
            }}
          >
            Join thousands of learners advancing their careers with Edunary.
            Start learning today — it's free to explore.
          </Typography>

          <Button
            className="cta-glow"
            variant="contained"
            component={RouterLink}
            to="/course/search"
            size="large"
            sx={{
              bgcolor: "#FFFFFF",
              color: "brand.darker",
              fontWeight: 700,
              fontSize: "1.1rem",
              px: 5,
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#F0FAF8",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default CTASection;
