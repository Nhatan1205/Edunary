import { Box, Link, Typography } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { getBreadcrumbLabel, shouldShowBreadcrumb } from "./breadcrumbConfig";

const Dot = () => (
  <Box
    component="span"
    sx={{
      display: "inline-block",
      width: 4,
      height: 4,
      borderRadius: "50%",
      bgcolor: "text.disabled",
      mx: 1.25,
      flexShrink: 0,
      alignSelf: "center",
    }}
  />
);

function CustomBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(x => x);

  const visibleSegments = pathnames
    .map((value, index) => {
      if (!shouldShowBreadcrumb(value)) return null;
      const to = `/${pathnames.slice(0, index + 1).join("/")}`;
      const label = getBreadcrumbLabel(to);
      const isLast = index === pathnames.length - 1;
      return { to, label, isLast };
    })
    .filter(Boolean);

  return (
    <Box
      aria-label="breadcrumb"
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        mb: 2,
        pt: 3,
      }}
    >
      {visibleSegments.map((seg, i) => (
        <Box key={seg.to} sx={{ display: "flex", alignItems: "center" }}>
          {i > 0 && <Dot />}
          {seg.isLast ? (
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 400,
                color: "text.secondary",
              }}
            >
              {seg.label}
            </Typography>
          ) : (
            <Link
              component={RouterLink}
              to={seg.to}
              underline="none"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "text.primary",
                "&:hover": { color: "brand.main" },
                transition: "color 0.15s",
              }}
            >
              {seg.label}
            </Link>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default CustomBreadcrumbs;