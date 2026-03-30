import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";
import BrushIcon from "@mui/icons-material/Brush";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CampaignIcon from "@mui/icons-material/Campaign";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import SchoolIcon from "@mui/icons-material/School";
import SecurityIcon from "@mui/icons-material/Security";
import CloudIcon from "@mui/icons-material/Cloud";
import ScienceIcon from "@mui/icons-material/Science";
import VideocamIcon from "@mui/icons-material/Videocam";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import HandymanIcon from "@mui/icons-material/Handyman";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import WorkIcon from "@mui/icons-material/Work";
import ViewInArIcon from "@mui/icons-material/ViewInAr";

// Map keyword (lowercase, partial match) → MUI icon
const iconRules = [
  { keywords: ["ai", "innovation", "machine learning", "artificial"], icon: <ScienceIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["animation", "3d"], icon: <ViewInArIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["art", "illustration"], icon: <AutoFixHighIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["craft", "diy", "handmade"], icon: <HandymanIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["creative career", "career"], icon: <WorkIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["creativity", "inspiration"], icon: <EmojiObjectsIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["design", "ui", "ux"], icon: <BrushIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["development", "web", "programming", "code"], icon: <CodeIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["film", "video"], icon: <VideocamIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["data", "database", "analytics"], icon: <StorageIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["business"], icon: <BusinessCenterIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["marketing"], icon: <CampaignIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["mobile"], icon: <PhoneAndroidIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["security", "cyber"], icon: <SecurityIcon sx={{ fontSize: 26 }} /> },
  { keywords: ["cloud", "devops"], icon: <CloudIcon sx={{ fontSize: 26 }} /> },
];

function getIconForCategory(title) {
  const lower = (title || "").toLowerCase();
  for (const rule of iconRules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.icon;
    }
  }
  return <SchoolIcon sx={{ fontSize: 26 }} />;
}

function CategoryCard({ category, className }) {
  const navigate = useNavigate();

  // API returns { id, title } — NOT { id, name }
  const label = category.title;

  const handleClick = () => {
    navigate(`/course/search?category=${category.id}`);
  };

  return (
    <Box
      onClick={handleClick}
      className={className}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        padding: "24px 12px",
        borderRadius: "16px",
        border: "1.5px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        cursor: "pointer",
        transition: "all 0.28s ease",
        height: "100%",
        "&:hover": {
          borderColor: "brand.main",
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(63, 204, 178, 0.15)",
          "& .cat-icon-wrap": {
            bgcolor: "brand.main",
            color: "text.inverse",
          },
        },
      }}
    >
      {/* Icon circle */}
      <Box
        className="cat-icon-wrap"
        sx={{
          width: 52,
          height: 52,
          borderRadius: "14px",
          bgcolor: "brand.lighter",
          color: "brand.dark",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.28s ease",
          flexShrink: 0,
        }}
      >
        {getIconForCategory(label)}
      </Box>

      {/* Category name */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          fontSize: { xs: "0.78rem", sm: "0.88rem" },
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default CategoryCard;
