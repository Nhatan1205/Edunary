import { createBrowserRouter } from "react-router-dom";
import Counter from "./components/Counter";
import Home from "./components/Home";
import ThemeDemo from "./components/ThemeDemo";
import UserLayout from "./layouts/UserLayout";
import Register from "./features/guest/auth/register/Register";
import Login from "./features/guest/auth/login/Login";
import ForgetPassword from "./features/guest/auth/forgetpassword/ForgetPassword";
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
        path: "/theme-demo",
        element: <ThemeDemo />,
      },
      {
        path: "/register",
        element: <Register />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/forget-password",
        element: <ForgetPassword />
      }
    ],
  },
]);

export default router;
