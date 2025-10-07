import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CreateSharpIcon from "@mui/icons-material/CreateSharp";
import { Link as RouterLink, useLocation } from "react-router";

export default function CourseManageSidebar({ sections, setActiveLabel }) {
  const location = useLocation();

  // Thêm onClick handler để update title
  function handleItemClick(label) {
    setActiveLabel(label);
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          position: "relative",
          border: "none",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {sections.map((section, i) => (
          <Box key={i} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              {section.title}
            </Typography>
            <List sx={{ p: 0 }}>
              {section.items.map((item, j) => {
                // Check nếu item đang active
                const isActive = location.pathname === item.path;

                return (
                  <ListItem
                    component={RouterLink}
                    to={item.path}
                    key={j}
                    // Thêm onClick để update title
                    onClick={() => handleItemClick(item.label)}
                    sx={{
                      py: 1,
                      px: 0,
                      pl: 1,
                      "&:hover": {
                        color: "text.secondary",
                        backgroundColor: "background.muted",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CreateSharpIcon
                        sx={{ fontSize: 20, color: "brand.main" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: 14,
                            color: "text.primary",
                            // Thêm fontWeight dựa vào isActive
                            fontWeight: isActive ? 800 : 400,
                          },
                        },
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
        {/* <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            bgcolor: "brand.main",
            textTransform: "none",
            "&:hover": { bgcolor: "brand.dark" },
          }}
        >
          Submit for Review
        </Button> */}
      </Box>
    </Drawer>
  );
}
