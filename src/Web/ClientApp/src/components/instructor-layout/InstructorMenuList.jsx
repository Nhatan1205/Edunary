import { memo, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import InstructorNavGroup from "./InstructorNavGroup";
import instructorMenuItems from "./instructorMenuItems";
import { useDrawer } from "./DrawerContext";

function InstructorMenuList() {
  const { drawerOpen } = useDrawer();
  const [selectedID, setSelectedID] = useState("");

  const navItems = instructorMenuItems.items.map((item) => {
    switch (item.type) {
      case "group":
        return (
          <InstructorNavGroup
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

export default memo(InstructorMenuList);
