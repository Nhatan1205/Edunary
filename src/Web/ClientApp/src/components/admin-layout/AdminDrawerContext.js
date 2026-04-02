import { createContext, useContext } from "react";

const AdminDrawerContext = createContext({
  drawerOpen: true,
  toggleDrawer: () => {},
  downMD: false,
});

export const useAdminDrawer = () => useContext(AdminDrawerContext);

export default AdminDrawerContext;
