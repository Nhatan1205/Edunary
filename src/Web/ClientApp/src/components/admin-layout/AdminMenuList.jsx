import { memo, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import AdminNavGroup from "./AdminNavGroup";
import adminMenuConfig from "./adminMenuConfig";
import { useAdminDrawer } from "./AdminDrawerContext";

function AdminMenuList() {
  const { drawerOpen } = useAdminDrawer();
  const [selectedID, setSelectedID] = useState("");

  const navItems = adminMenuConfig.items.map((item) => {
    switch (item.type) {
      case "group":
        return (
          <AdminNavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
          />
        );
      default:
        return (
          <Typography
            key={item.id}
            variant="h6"
            align="center"
            sx={{ color: "error.main" }}
          >
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(AdminMenuList);
