import { useEffect, useState, memo } from "react";
import { matchPath, useLocation } from "react-router";

import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";

import AdminNavCollapse from "./AdminNavCollapse";
import AdminNavItem from "./AdminNavItem";
import { useAdminDrawer } from "./AdminDrawerContext";

function AdminNavGroup({ item, setSelectedID, selectedID }) {
  const { pathname } = useLocation();
  const { drawerOpen } = useAdminDrawer();

  const [currentItem] = useState(item);

  const checkOpenForParent = (child, id) => {
    child.forEach((ele) => {
      if (ele.children?.length) {
        checkOpenForParent(ele.children, currentItem.id);
      }
      if (
        ele?.url &&
        !!matchPath({ path: ele.url, end: true }, pathname)
      ) {
        setSelectedID(id);
      }
    });
  };

  const checkSelectedOnload = (data) => {
    const children = data.children ? data.children : [];
    children.forEach((itemCheck) => {
      if (itemCheck?.children?.length) {
        checkOpenForParent(itemCheck.children, currentItem.id);
      }
      if (
        itemCheck?.url &&
        !!matchPath({ path: itemCheck.url, end: true }, pathname)
      ) {
        setSelectedID(currentItem.id);
      }
    });

    if (
      data?.url &&
      !!matchPath({ path: data.url, end: true }, pathname)
    ) {
      setSelectedID(currentItem.id);
    }
  };

  useEffect(() => {
    checkSelectedOnload(currentItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentItem]);

  const items = currentItem.children?.map((menu) => {
    switch (menu?.type) {
      case "collapse":
        return (
          <AdminNavCollapse
            key={menu.id}
            menu={menu}
            level={1}
            parentId={currentItem.id}
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
          currentItem.title &&
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
              {currentItem.title}
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
