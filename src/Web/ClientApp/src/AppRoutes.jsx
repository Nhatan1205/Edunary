import { createBrowserRouter, Navigate } from "react-router";
import Counter from "./components/Counter";
import ThemeDemo from "./components/ThemeDemo";
import UserLayout from "./layouts/UserLayout";
import Homepage from "./features/guest/homepage/Homepage";
import CartPage from "./features/user/cart-page/CartPage";
import Register from "./features/guest/auth/register/Register";
import Login from "./features/guest/auth/login/Login";
import ForgetPassword from "./features/guest/auth/forgetpassword/ForgetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import InstructorLayout from "./layouts/InstructorLayout";
import CoursesManagement from "./features/instructor/courses-management/CoursesManagement";
import CourseOverview from "./features/guest/course-overview/CourseOverview";


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
        path: "/theme-demo",
        element: <ThemeDemo />,
      },
      {
        path: "/cart",
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/forget-password",
        element: <ForgetPassword />,
      },
      {
        path: "/course/:id",
        element: <CourseOverview />,
      }
    ],
  },
  {
    path: "/instructor",
    element: <InstructorLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/instructor/courses" replace />,
      },
      {
        path: "courses",
        element: <CoursesManagement />,
      },
    ],
  },
]);

export default router;
