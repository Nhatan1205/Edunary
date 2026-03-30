import { Box } from "@mui/material";
import HeroSection from "./hero-section/HeroSection";
import StatsBarSection from "./stats-section/StatsBarSection";
import CourseSection from "./course-section/CourseSection";
import CategorySection from "./category-section/CategorySection";
import CareerPathSection from "./career-path-section/CareerPathSection";
import InstructorSection from "./instructor-section/InstructorSection";
import WhyChooseUsSection from "./why-choose-us-section/WhyChooseUsSection";
import CTASection from "./cta-section/CTASection";
import ChangePassword from "../../../components/change-password/ChangePassword";
import { tokenService } from "../../../utils/tokenService";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import "./homepage-animations.css";

function Homepage() {
  const { isAuthenticated } = useAuth();
  const requiresPasswordChange = isAuthenticated ? tokenService.getRequiresPasswordChange() : false;
  const defaultPassword = isAuthenticated ? tokenService.getDefaultPassword() : null;
  const isFirstLogin = !!defaultPassword;

  const [isModalOpen, setIsModalOpen] = useState(requiresPasswordChange);

  const handleCloseChangePassword = () => {
    tokenService.clearRequiresPasswordChange();
    setIsModalOpen(false);
  };

  return (
    <Box
      component={"main"}
      sx={{
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Decorative Background Blobs ── */}
      {/* Blob 1 — top-right */}
      <Box
        className="blob-drift-1"
        sx={{
          position: "absolute",
          top: "5%",
          right: "-6%",
          width: { xs: "50vw", md: "28vw" },
          height: { xs: "50vw", md: "28vw" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(126,219,201,0.13) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Blob 2 — upper-left */}
      <Box
        className="blob-drift-2"
        sx={{
          position: "absolute",
          top: "12%",
          left: "-8%",
          width: { xs: "40vw", md: "20vw" },
          height: { xs: "40vw", md: "20vw" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(73,187,189,0.10) 0%, transparent 70%)",
          filter: "blur(65px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Blob 3 — mid-right */}
      <Box
        className="blob-drift-1"
        sx={{
          position: "absolute",
          top: "30%",
          right: "-4%",
          width: { xs: "35vw", md: "18vw" },
          height: { xs: "35vw", md: "18vw" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(63,204,178,0.09) 0%, transparent 70%)",
          filter: "blur(70px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Blob 4 — center-left */}
      <Box
        className="blob-drift-2"
        sx={{
          position: "absolute",
          top: "45%",
          left: "-6%",
          width: { xs: "45vw", md: "24vw" },
          height: { xs: "45vw", md: "24vw" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(126,219,201,0.11) 0%, transparent 70%)",
          filter: "blur(75px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Blob 5 — lower-right */}
      <Box
        className="blob-drift-1"
        sx={{
          position: "absolute",
          top: "60%",
          right: "-7%",
          width: { xs: "38vw", md: "22vw" },
          height: { xs: "38vw", md: "22vw" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(73,187,189,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Blob 6 — near-bottom left */}
      <Box
        className="blob-drift-2"
        sx={{
          position: "absolute",
          bottom: "18%",
          left: "-5%",
          width: { xs: "42vw", md: "20vw" },
          height: { xs: "42vw", md: "20vw" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(63,204,178,0.10) 0%, transparent 70%)",
          filter: "blur(70px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Blob 7 — bottom-right */}
      <Box
        className="blob-drift-1"
        sx={{
          position: "absolute",
          bottom: "5%",
          right: "-3%",
          width: { xs: "36vw", md: "16vw" },
          height: { xs: "36vw", md: "16vw" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(126,219,201,0.09) 0%, transparent 70%)",
          filter: "blur(65px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ── Page Sections ── */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <HeroSection />
        <StatsBarSection />
        <CourseSection />
        <CategorySection />
        <CareerPathSection />
        <InstructorSection />
        <WhyChooseUsSection />
        <CTASection />
      </Box>

      <ChangePassword
        open={isModalOpen}
        onClose={handleCloseChangePassword}
        isFirstLogin={isFirstLogin}
        defaultPassword={defaultPassword || ""}
      />
    </Box>
  );
}

export default Homepage;
