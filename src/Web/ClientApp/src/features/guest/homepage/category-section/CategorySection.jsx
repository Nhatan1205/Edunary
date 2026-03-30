import { Box, Typography, Button } from "@mui/material";
import { Container } from "reactstrap";
import { Link as RouterLink } from "react-router";
import useGetCategories from "../../../../hooks/category-hooks/useGetCategories";
import useScrollAnimation from "../../../../hooks/common/useScrollAnimation";
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
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const iconRules = [
  { keywords: ["ai", "innovation", "machine learning", "artificial"], icon: <ScienceIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["animation", "3d"], icon: <ViewInArIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["art", "illustration"], icon: <AutoFixHighIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["craft", "diy"], icon: <HandymanIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["creative career", "career"], icon: <WorkIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["creativity", "inspiration"], icon: <EmojiObjectsIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["design", "ui", "ux"], icon: <BrushIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["development", "web", "programming"], icon: <CodeIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["film", "video"], icon: <VideocamIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["data", "database", "analytics"], icon: <StorageIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["business"], icon: <BusinessCenterIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["marketing"], icon: <CampaignIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["mobile"], icon: <PhoneAndroidIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["security", "cyber"], icon: <SecurityIcon sx={{ fontSize: 20 }} /> },
  { keywords: ["cloud", "devops"], icon: <CloudIcon sx={{ fontSize: 20 }} /> },
];

function getIcon(title) {
  const lower = (title || "").toLowerCase();
  for (const rule of iconRules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.icon;
  }
  return <SchoolIcon sx={{ fontSize: 20 }} />;
}

// Single pill style — no isHighlighted, all look the same
function CategoryPill({ category }) {
  return (
    <Box
      component={RouterLink}
      to={`/course/search?category=${category.id}`}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 2.5,
        py: 1.25,
        borderRadius: "50px",
        border: "1.5px solid",
        borderColor: "rgba(255,255,255,0.25)",
        bgcolor: "transparent",
        color: "text.inverse",
        cursor: "pointer",
        whiteSpace: "nowrap",
        textDecoration: "none",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          bgcolor: "brand.main",
          borderColor: "brand.main",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", opacity: 0.85 }}>
        {getIcon(category.title)}
      </Box>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: { xs: "0.75rem", sm: "0.82rem" },
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {category.title}
      </Typography>
      <ChevronRightIcon sx={{ fontSize: 17, opacity: 0.7 }} />
    </Box>
  );
}

function CategorySection() {
  const titleRef = useScrollAnimation("fade-in-up");
  const pillsRef = useScrollAnimation("fade-in-up", { threshold: 0.1 });

  const { data: categoryData, isLoading } = useGetCategories(1, 7);
  const categories = categoryData?.items ?? [];

  if (!isLoading && categories.length === 0) return null;

  const firstRow = categories.slice(0, 4);
  const secondRow = categories.slice(4, 7);

  return (
    <Box
      component="section"
      sx={{
        bgcolor: "brand.dark",
        py: { xs: 6, md: 8 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Small floating dots */}
      {[
        { color: "rgba(255,255,255,0.20)", size: 10, top: "12%", left: "5%", delay: "0s" },
        { color: "rgba(255,255,255,0.15)", size: 14, top: "20%", right: "8%", delay: "1.2s" },
        { color: "rgba(255,255,255,0.18)", size: 8, bottom: "15%", left: "12%", delay: "0.6s" },
        { color: "rgba(255,255,255,0.12)", size: 12, bottom: "25%", right: "4%", delay: "2s" },
        { color: "rgba(255,255,255,0.16)", size: 10, top: "55%", right: "18%", delay: "1.8s" },
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
        {/* Heading */}
        <Box ref={titleRef} sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "text.inverse",
              fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.1rem" },
              lineHeight: 1.35,
              maxWidth: 620,
              mx: "auto",
            }}
          >
            Master the skills the world needs.{" "}
            <Box component="span" sx={{ color: "rgba(255,255,255,0.75)" }}>
              Pick the category you want to learn.
            </Box>
          </Typography>
        </Box>

        {/* Pills — 2 rows, all identical style */}
        {!isLoading && categories.length > 0 && (
          <Box ref={pillsRef}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: { xs: 1.25, md: 1.75 },
                mb: { xs: 1.25, md: 1.75 },
              }}
            >
              {firstRow.map((cat) => (
                <CategoryPill key={cat.id} category={cat} />
              ))}
            </Box>
            {secondRow.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: { xs: 1.25, md: 1.75 },
                }}
              >
                {secondRow.map((cat) => (
                  <CategoryPill key={cat.id} category={cat} />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default CategorySection;
