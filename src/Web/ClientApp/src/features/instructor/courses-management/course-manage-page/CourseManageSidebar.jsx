import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CreateSharpIcon from "@mui/icons-material/CreateSharp";
import { Link as RouterLink, useLocation } from "react-router";

export default function CourseManageSidebar({ sections, setActiveLabel }) {
  const location = useLocation();

  function handleItemClick(label) {
    setActiveLabel(label);
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 272,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 272,
          boxSizing: "border-box",
          position: "relative",
          border: "none",
          bgcolor: "transparent",
          overflowX: "hidden",
        },
      }}
    >
      <Box sx={{ pt: 1, pb: 2 }}>
        {sections.map((section, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            {/* Section Header */}
            <Box sx={{ px: 2, mb: 0.75 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "text.tertiary",
                  fontSize: "0.68rem",
                  display: "block",
                }}
              >
                {section.title}
              </Typography>
            </Box>

            <List sx={{ p: 0 }}>
              {section.items.map((item, j) => {
                const isActive = location.pathname === item.path;

                return (
                  <ListItem
                    component={RouterLink}
                    to={item.path}
                    key={j}
                    onClick={() => handleItemClick(item.label)}
                    sx={{
                      py: 0.85,
                      px: 0,
                      pl: 1,
                      mx: 1,
                      width: "calc(100% - 16px)",
                      borderRadius: "8px",
                      position: "relative",
                      textDecoration: "none",
                      transition: "all 0.18s ease",
                      mb: 0.25,
                      // Active state
                      ...(isActive && {
                        bgcolor: "background.muted",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "20%",
                          height: "60%",
                          width: 3,
                          borderRadius: "0 3px 3px 0",
                          bgcolor: "brand.main",
                        },
                      }),
                      "&:hover": {
                        color: "text.secondary",
                        backgroundColor: "background.muted",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <CreateSharpIcon
                        sx={{
                          fontSize: 17,
                          color: isActive ? "brand.main" : "text.tertiary",
                          transition: "color 0.18s ease",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: "0.855rem",
                            color: isActive ? "text.primary" : "text.secondary",
                            fontWeight: isActive ? 700 : 450,
                            letterSpacing: "0.01em",
                            transition: "all 0.18s ease",
                          },
                        },
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>

            {/* Separator between sections */}
            {i < sections.length - 1 && (
              <Divider sx={{ mx: 2, mt: 1.5, borderColor: "divider" }} />
            )}
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}
