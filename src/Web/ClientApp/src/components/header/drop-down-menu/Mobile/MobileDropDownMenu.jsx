import { Close } from "@mui/icons-material";
import { Box, Drawer, IconButton } from "@mui/material";
import MobileSection from "./MobileSection";

function MobileDropDownMenu({ open, onClose, categories_data, MENU_DATA }) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "60%",
          maxWidth: "300px",
          backgroundColor: "background.paper",
        },
      }}
      SlideProps={{ direction: "right" }}
    >
      <Box sx={{ p: 2 }}>
        {/* Close Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Categories */}
        <MobileSection
          title="Classes by Category"
          items={categories_data}
          onItemClick={onClose}
        />

        {/* Business Items */}
        <MobileSection
          title="Partnership"
          items={MENU_DATA.business}
          onItemClick={onClose}
          bordered
        />

        {/* Resources */}
        <MobileSection
          title="Resources"
          items={MENU_DATA.resources}
          onItemClick={onClose}
          bordered
        />
      </Box>
    </Drawer>
  );
}

export default MobileDropDownMenu;
