import { Box } from "@mui/material";
import CourseSection from "./course-section/CourseSection";
import HeroSection from "./hero-section/HeroSection";
import { useState } from "react";
import ChangePassword from "../../../components/change-password/ChangePassword";
import { tokenService } from "../../../utils/tokenService";
import { useAuth } from "../../../context/AuthContext";

function Homepage() {
  const { isAuthenticated } = useAuth();
  const requiresPasswordChange = isAuthenticated ? tokenService.getRequiresPasswordChange() : false;
  const defaultPassword = isAuthenticated ? tokenService.getDefaultPassword() : null;
  const isFirstLogin = !!defaultPassword;
  
  const [isModalOpen, setIsModalOpen] = useState(requiresPasswordChange);

  const handleCloseChangePassword = () => {
    // Always allow closing modal
    // User can choose to change password later
    tokenService.clearRequiresPasswordChange();
    setIsModalOpen(false);
  };

  return (
    <Box component={"main"} sx={{ bgcolor: "background.default" }}>
      <HeroSection />
      <CourseSection />
      
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
