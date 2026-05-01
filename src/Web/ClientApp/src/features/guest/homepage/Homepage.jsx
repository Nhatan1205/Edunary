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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./homepage-animations.css";

function Homepage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const requiresPasswordChange = isAuthenticated ? tokenService.getRequiresPasswordChange() : false;
  const defaultPassword = isAuthenticated ? tokenService.getDefaultPassword() : null;
  const isFirstLogin = isAuthenticated ? tokenService.getIsFirstLogin() : false;
  const isFirstLoginFromSocial = !!defaultPassword;

  const [isModalOpen, setIsModalOpen] = useState(requiresPasswordChange);

  useEffect(() => {
    if (!isFirstLogin) return;
    if (requiresPasswordChange) return;
    tokenService.clearIsFirstLogin();
    navigate("/personalize");
  }, [isFirstLogin, requiresPasswordChange, navigate]);

  const handleCloseChangePassword = () => {
    tokenService.clearRequiresPasswordChange();
    setIsModalOpen(false);
    if (isFirstLogin) {
      tokenService.clearIsFirstLogin();
      navigate("/personalize");
    }
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
        isFirstLogin={isFirstLoginFromSocial}
        defaultPassword={defaultPassword || ""}
      />
    </Box>
  );
}

export default Homepage;

