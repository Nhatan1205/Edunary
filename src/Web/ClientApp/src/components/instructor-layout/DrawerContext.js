import { createContext, useContext } from "react";

const DrawerContext = createContext({
  drawerOpen: true,
  toggleDrawer: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

export default DrawerContext;
