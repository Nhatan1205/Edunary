import { createContext, useContext } from "react";

const AdminDrawerContext = createContext({
  drawerOpen: true,
  toggleDrawer: () => {},
});

export const useAdminDrawer = () => useContext(AdminDrawerContext);

export default AdminDrawerContext;
