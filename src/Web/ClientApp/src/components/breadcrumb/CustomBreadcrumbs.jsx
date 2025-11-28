import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { getBreadcrumbLabel, shouldShowBreadcrumb } from "./breadcrumbConfig";

function CustomBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(x => x);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      {pathnames.map((value, index) => {
        // Bỏ qua nếu segment là ID
        if (!shouldShowBreadcrumb(value)) {
          return null;
        }

        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const label = getBreadcrumbLabel(to);

        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <Typography color="text.primary" key={to}>
            {label}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            to={to}
            key={to}
            underline="none"
            sx={{
              color: 'brand.dark',
              '&:hover': {
                color: 'brand.darker',
                textDecoration: 'none',
              },
            }}
          >
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

export default CustomBreadcrumbs;