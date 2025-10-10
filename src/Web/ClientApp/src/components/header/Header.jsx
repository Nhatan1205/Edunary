import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Collapse,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import SearchBar from "./SearchBar";
import { Link as RouterLink } from "react-router";
import { KeyboardArrowDown, Lightbulb, Search } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import DropDownMenu from "./drop-down-menu/DropDownMenu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DropDownProfile from "./drop-down-profile/DropDownProfile";
import AvatarImage from "../../assets/images/avatar.jpg";
import { useAuth } from "../../context/AuthContext";
import NotificationPopup from "../notification-popup/NotificationPopup";
import useGetNotificationsByUserId from "../../hooks/useGetNotificationByUserId";

function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // Get auth state from context
  const { isAuthenticated, user } = useAuth();

  //menu dropdown state
  const [anchorElMenu, setAnchorElMenu] = useState(null);
  const isOpenMenu = Boolean(anchorElMenu);

  const handleOpenMenu = (event) => setAnchorElMenu(event.currentTarget);
  const handleCloseMenu = () => setAnchorElMenu(null);

  //profile dropdown state
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const isOpenProfile = Boolean(anchorElProfile);

  const handleOpenProfile = (event) => setAnchorElProfile(event.currentTarget);
  const handleCloseProfile = () => setAnchorElProfile(null);

  // Notification dropdown state
  const [anchorElNotification, setAnchorElNotification] = useState(null);
  const isOpenNotification = Boolean(anchorElNotification);

  const handleOpenNotification = (event) =>
    setAnchorElNotification(event.currentTarget);
  const handleCloseNotification = () => setAnchorElNotification(null);
  //search bar mobile collapse state
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  //notification state
  const { data: dataNofications } = useGetNotificationsByUserId();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "white",
          color: "text.primary",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              flexDirection: "row",
              justifyContent: isMobile ? "space-between" : "flex-start",
              alignItems: "center",
              px: isMobile ? 1 : 3,
              gap: 2,
            }}
          >
            {/* Left part - mobile view*/}
            {isMobile && (
              <>
                <IconButton onClick={handleOpenMenu} sx={{ padding: "8px" }}>
                  <MenuIcon />
                </IconButton>
                <IconButton onClick={toggle} sx={{ padding: "8px", ml: 1 }}>
                  <Search />
                </IconButton>
                <DropDownMenu
                  open={isOpenMenu}
                  anchorEl={anchorElMenu}
                  handleCloseDropDown={handleCloseMenu}
                  isMobile={isMobile}
                />
              </>
            )}
            {/* Logo part */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexGrow: 1,
                justifyContent: isMobile ? "center" : "flex-start",
                mx: isMobile ? 2 : 0,
                mr: "8px",
                textDecoration: "none",
              }}
            >
              <Lightbulb
                sx={{
                  color: "brand.main",
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontSize: isMobile ? "20px" : "24px",
                  fontWeight: "bold",
                  color: "brand.main",
                  ml: 1,
                }}
              >
                Edunary
              </Typography>
            </Box>

            {/* Left part - desktop view */}
            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  onClick={handleOpenMenu}
                  endIcon={<KeyboardArrowDown />}
                  sx={{
                    color: "text.primary",
                    textTransform: "none",
                    padding: "10px 24px",
                    fontSize: "16px",
                    fontWeight: "500",
                    borderRadius: "8px",
                    "&:hover": {
                      color: "text.secondary",
                      backgroundColor: "background.muted",
                    },
                    ...(isOpenMenu && {
                      color: "text.secondary",
                      backgroundColor: "background.muted",
                    }),
                  }}
                >
                  Explore
                </Button>
                <DropDownMenu
                  open={isOpenMenu}
                  anchorEl={anchorElMenu}
                  handleCloseDropDown={handleCloseMenu}
                  isMobile={isMobile}
                />
              </Box>
            )}

            {/* searchBar - mobile view */}
            {!isMobile && <SearchBar />}

            {/* Right Part - desktop view */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 1 : 2,
              }}
            >
              {isAuthenticated ? (
                // Logged In Menu
                <>
                  {!isMobile && (
                    <Button
                      sx={{
                        color: "text.primary",
                        textTransform: "none",
                        padding: "10px 24px",
                        fontSize: "16px",
                        fontWeight: "500",
                        borderRadius: "8px",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          color: "text.secondary",
                          backgroundColor: "background.muted",
                        },
                      }}
                    >
                      My Learning
                    </Button>
                  )}

                  <IconButton
                    size={isMobile ? "medium" : "large"}
                    aria-label="show cart items"
                    sx={{
                      color: "text.primary",
                      padding: isMobile ? "6px" : "10px",
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "background.muted",
                      },
                    }}
                  >
                    <Badge badgeContent={3} color="error" showZero>
                      <ShoppingCartOutlinedIcon
                        fontSize={isMobile ? "small" : "medium"}
                      />
                    </Badge>
                  </IconButton>

                  <IconButton
                    size={isMobile ? "medium" : "large"}
                    aria-label="show new notifications"
                    sx={{
                      color: "text.primary",
                      padding: isMobile ? "6px" : "10px",
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "background.muted",
                      },
                    }}
                    onClick={handleOpenNotification}
                  >
                    <Badge
                      badgeContent={dataNofications?.unreadCount}
                      color="error"
                      size="medium"
                    >
                      <NotificationsNoneOutlinedIcon
                        fontSize={isMobile ? "small" : "medium"}
                      />
                    </Badge>
                  </IconButton>
                  <NotificationPopup
                    open={isOpenNotification}
                    anchorEl={anchorElNotification}
                    handleClosePopup={handleCloseNotification}
                    notifications={dataNofications?.list}
                  />

                  <IconButton
                    size={isMobile ? "medium" : "large"}
                    aria-label="user account"
                    sx={{
                      color: "text.primary",
                      padding: isMobile ? "6px" : "10px",
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "background.muted",
                      },
                    }}
                    onClick={handleOpenProfile}
                  >
                    <Avatar
                      alt={user?.fullName || user?.email || "User"}
                      src={user?.avatar || AvatarImage}
                      sx={{
                        width: isMobile ? 32 : 40,
                        height: isMobile ? 32 : 40,
                      }}
                    />
                  </IconButton>
                  <DropDownProfile
                    open={isOpenProfile}
                    anchorEl={anchorElProfile}
                    handleCloseDropDown={handleCloseProfile}
                    isMobile={isMobile}
                  />
                </>
              ) : (
                // Logged Out Menu
                <>
                  <Button
                    component={RouterLink}
                    to={"register"}
                    variant="outlined"
                    sx={{
                      fontWeight: "bold",
                      borderRadius: "8px",
                      padding: isMobile ? "8px 16px" : "10px 24px",
                      textTransform: "none",
                      fontSize: isMobile ? "14px" : "16px",
                      whiteSpace: "nowrap",
                      color: "brand.main",
                      borderColor: "brand.main",

                      ml: "8px",
                      "&:hover": {
                        borderColor: "brand.dark",
                        color: "brand.dark",
                        backgroundColor: "background.muted",
                      },
                    }}
                  >
                    Sign up
                  </Button>
                  <Button
                    component={RouterLink}
                    to={"login"}
                    variant="contained"
                    sx={{
                      fontWeight: "bold",
                      borderRadius: "8px",
                      padding: isMobile ? "8px 16px" : "10px 24px",
                      textTransform: "none",
                      fontSize: isMobile ? "14px" : "16px",
                      whiteSpace: "nowrap",
                      backgroundColor: "brand.main",
                      "&:hover": {
                        backgroundColor: "brand.dark",
                      },
                    }}
                  >
                    Log in
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>

          {/* Search bar - mobile view */}
          {isMobile && (
            <Collapse in={isOpen}>
              <Box
                sx={{
                  width: "100%",
                  px: 2,
                  pb: 2,
                  backgroundColor: "background.paper",
                }}
              >
                <SearchBar isMobileExpanded={true} onClose={close} />
              </Box>
            </Collapse>
          )}
        </Container>
      </AppBar>
    </Box>
  );
}

export default Header;
