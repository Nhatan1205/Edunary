import Counter from "./components/Counter";
import FetchData from "./components/FetchData";
import Home from "./components/Home";
import ThemeDemo from "./components/ThemeDemo";

const AppRoutes = [
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
];

export default AppRoutes;
