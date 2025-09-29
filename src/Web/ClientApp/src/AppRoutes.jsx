import { createBrowserRouter } from "react-router-dom";
import Counter from "./components/Counter";
import FetchData from "./components/FetchData";
import ThemeDemo from "./components/ThemeDemo";
import UserLayout from "./layouts/UserLayout";
import Homepage from "./features/guest/homepage/Homepage";

const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "/counter",
        element: <Counter />,
      },
      {
        path: "/fetch-data",
        element: <FetchData />,
      },
      {
        path: "/theme-demo",
        element: <ThemeDemo />,
      },
    ],
  },
]);

export default router;
