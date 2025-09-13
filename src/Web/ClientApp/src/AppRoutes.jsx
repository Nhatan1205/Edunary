import { createBrowserRouter } from "react-router-dom";
import Counter from "./components/Counter";
import FetchData from "./components/FetchData";
import Home from "./components/Home";
import ThemeDemo from "./components/ThemeDemo";
import UserLayout from "./layouts/UserLayout";

const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <Home />,
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
