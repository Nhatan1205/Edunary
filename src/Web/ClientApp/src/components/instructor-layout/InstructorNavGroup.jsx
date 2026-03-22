import { useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";

import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";

import InstructorNavCollapse from "./InstructorNavCollapse";
import InstructorNavItem from "./InstructorNavItem";
import { useDrawer } from "./DrawerContext";

export default function InstructorNavGroup({
  item,
  setSelectedID,
  selectedID,
}) {
  const { pathname } = useLocation();
  const { drawerOpen } = useDrawer();

  const [currentItem, setCurrentItem] = useState(item);

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
          <InstructorNavCollapse
            key={menu.id}
            menu={menu}
            level={1}
            parentId={currentItem.id}
          />
        );
      case "item":
        return <InstructorNavItem key={menu.id} item={menu} level={1} />;
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
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "text.secondary",
                padding: 0.75,
                textTransform: "capitalize",
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
