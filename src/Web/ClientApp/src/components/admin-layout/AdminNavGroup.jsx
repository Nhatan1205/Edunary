import { memo } from "react";

import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";

import AdminNavCollapse from "./AdminNavCollapse";
import AdminNavItem from "./AdminNavItem";
import { useAdminDrawer } from "./AdminDrawerContext";

function AdminNavGroup({ item }) {
  const { drawerOpen } = useAdminDrawer();

  const items = item.children?.map((menu) => {
    switch (menu?.type) {
      case "collapse":
        return (
          <AdminNavCollapse
            key={menu.id}
            menu={menu}
            level={1}
          />
        );
      case "item":
        return <AdminNavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography
            key={menu?.id}
            variant="h6"
            align="center"
            sx={{ color: "error.main" }}
          >
            Menu Items Error
          </Typography>
        );
    }
  });

  return (
    <>
      <List
        disablePadding={!drawerOpen}
        subheader={
          item.title &&
          drawerOpen && (
            <Typography
              variant="caption"
              gutterBottom
              sx={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "text.disabled",
                padding: 0.75,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: 1.25,
              }}
            >
              {item.title}
            </Typography>
          )
        }
      >
        {items}
      </List>

      {drawerOpen && <Divider sx={{ mt: 0.25, mb: 1.25 }} />}
    </>
  );
}

export default memo(AdminNavGroup);
