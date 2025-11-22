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
import GuestRoute from "./components/GuestRoute";
import InstructorLayout from "./layouts/InstructorLayout";
import CourseOverview from "./features/guest/course-overview/CourseOverview";
import CheckoutPage from "./features/user/checkout/CheckoutPage";
import PaymentSuccess from "./features/user/checkout/PaymentSuccess";

import CreateCourse from "./features/instructor/courses-management/create-course-page/CreateCourse";
import CourseLandingPage from "./features/instructor/courses-management/course-manage-page/pages/CourseLandingPage";
import CoursePricing from "./features/instructor/courses-management/course-manage-page/pages/CoursePricing";
import CourseManageLayout from "./layouts/CourseManageLayout";
import CourseSetting from "./features/instructor/courses-management/course-manage-page/pages/CourseSetting";
import CourseIntenedLearners from "./features/instructor/courses-management/course-manage-page/pages/CourseIntenedLearners";
import CourseMessages from "./features/instructor/courses-management/course-manage-page/pages/CourseMessages";
import CourseCurriculum from "./features/instructor/courses-management/course-manage-page/pages/CourseCurriculum";
import CourseCaptions from "./features/instructor/courses-management/course-manage-page/pages/CourseCaptions";
import CourseAccessiblity from "./features/instructor/courses-management/course-manage-page/pages/CourseAccessiblity";
import CoursesListPage from "./features/instructor/courses-management/courses-list-page/CoursesListPage";
import SearchPage from "./features/guest/search-page/SearchPage";
import FAQPage from "./features/guest/faq-page/FAQPage";

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
        element: (
          <GuestRoute>
            <Register />
          </GuestRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: "/forget-password",
        element: (
          <GuestRoute>
            <ForgetPassword />
          </GuestRoute>
        ),
      },
      {
        path: "/course/:id",
        element: <CourseOverview />,
      },
      {
        path: "/course/search",
        element: <SearchPage />,
      },
            {
        path: "/faq",
        element: <FAQPage />,
      },
      {
        path: "/payment/checkout",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/payment-success",
        element: (
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        ),
      }
    ],
  },
  {
    path: "/instructor",

    element: (
      <ProtectedRoute>
        <InstructorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/instructor/courses" replace />,
      },
      {
        path: "courses",
        element: <CoursesListPage />,
      },
    ],
  },
  {
    path: "/course/create/",
    element: (
      <ProtectedRoute>
        <CreateCourse />
      </ProtectedRoute>
    ),
  },
  {
    path: "/instructor/course/:courseId/manage/",
    element: (
      <ProtectedRoute>
        <CourseManageLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="basics" replace />,
      },
      {
        path: "basics",
        element: <CourseLandingPage />,
      },
      {
        path: "pricing",
        element: <CoursePricing />,
      },
      {
        path: "learners",
        element: <CourseIntenedLearners />,
      },
      {
        path: "messages",
        element: <CourseMessages />,
      },
      {
        path: "settings",
        element: <CourseSetting />,
      },
      {
        path: "curriculum",
        element: <CourseCurriculum />,
      },
      {
        path: "captions",
        element: <CourseCaptions />,
      },
      {
        path: "accessibility",
        element: <CourseAccessiblity />,
      },
    ],
  },
]);

export default router;
