import { Box, Grid, Menu } from "@mui/material";
import DesktopSection from "./DesktopSection";

function DesktopDropDownMenu({
  open,
  anchorEl,
  onClose,
  categories_data,
  MENU_DATA,
}) {
  return (
    <Menu
      disableScrollLock={true}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "600px",
          maxHeight: "none",
          mt: 1,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          border: "1px solid #ebebeb",
        },
      }}
      transformOrigin={{ horizontal: "left", vertical: "top" }}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
    >
      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Left Column - Categories */}
          <Grid
            size={7}
            sx={{ paddingRight: "32px", borderRight: "1px solid grey" }}
          >
            <DesktopSection
              title="Classes by Category"
              items={categories_data}
              onItemClick={onClose}
              sx={{ fontSize: "13px" }}
            />
          </Grid>

          {/* Right Column - Business & Resources */}
          <Grid size={5}>
            <DesktopSection
              title="Partnership"
              items={MENU_DATA.business}
              onItemClick={onClose}
              bordered
              sx={{ fontSize: "13px", mb: 3 }}
            />

            <DesktopSection
              title="Resources"
              items={MENU_DATA.resources}
              onItemClick={onClose}
              bordered
              sx={{ fontSize: "13px", mb: 3, mt: 4 }}
            />
          </Grid>
        </Grid>
      </Box>
    </Menu>
  );
}

export default DesktopDropDownMenu;
