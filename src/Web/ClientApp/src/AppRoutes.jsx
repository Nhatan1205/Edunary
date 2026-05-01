import { createBrowserRouter, Navigate } from "react-router";
import Counter from "./components/Counter";
import ThemeDemo from "./components/ThemeDemo";
import UserLayout from "./layouts/UserLayout";
import Homepage from "./features/guest/homepage/Homepage";
import CartPage from "./features/user/cart-page/CartPage";
import Register from "./features/guest/auth/register/Register";
import Login from "./features/guest/auth/login/Login";
import ForgetPassword from "./features/guest/auth/forgetpassword/ForgetPassword";
import ResetPassword from "./features/guest/auth/resetpassword/ResetPassword";
import VerifyRegistration from "./features/guest/auth/verify/VerifyRegistration";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
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
import MyLearning from "./features/user/my-learning/MyLearning";
import CourseLearnLayout from "./layouts/CourseLearnLayout";
import VideoPlayerPage from "./features/user/course-learn/video-player/VideoPlayer";
import QuizPlayerPage from "./features/user/course-learn/quiz-player/QuizPlayer";
import FAQPage from "./features/guest/faq-page/FAQPage";
import AboutPage from "./features/guest/about-page/AboutPage";
import OverviewPage from "./features/instructor/performance-section/overview-page/CourseOverviewPage";
import RevenuePage from "./features/instructor/performance-section/revenue-page/RevenuePage";
import PolicyPage from "./features/guest/policy-page/PolicyPage";
import AnnouncementsPage from "./features/instructor/communication-section/announcements-page/AnnouncementsPage";
import AnnouncementComposePage from "./features/instructor/communication-section/announcements-page/announcements-compose-page.jsx/AnnouncementComposePage";
import AnnouncementEditPage from "./features/instructor/communication-section/announcements-page/announcements-edit-page.jsx/AnnouncementEditPage";
import CourseInitialRedirect from "./features/user/my-learning/CourseInitialRedirect";
import NotFound from "./components/NotFound";
import ProfileManageLayout from "./layouts/ProfileManageLayout";
import ProfileInfoPage from "./features/user/profile/pages/ProfileInfoPage";
import ProfilePhotoPage from "./features/user/profile/pages/ProfilePhotoPage";
import AccountSecurityPage from "./features/user/profile/pages/AccountSecurityPage";
import ProfilePage from "./features/guest/profile-page/ProfilePage";
import InstructorCoursePreviewPage from "./features/instructor/courses-management/course-preview-page/InstructorCoursePreviewPage";
import CareerPathOverviewPage from "./features/guest/career-paths-overview-page/CareerPathOverviewPage";
import CareerPathPage from "./features/guest/career-paths-page/CareerPathPage";
import RoadMapsPage from "./features/instructor/courses-management/roadmaps-page/RoadMapsPage";
import RoadmapEditPage from "./features/instructor/courses-management/roadmap-edit-page/RoadmapEditPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./features/admin/Dashboard";
import SystemSettingsPage from "./features/admin/system-settings/SystemSettingsPage";
import CategoryPage from "./features/admin/course-section/category-page/CategoryPage";
import UserPage from "./features/admin/user-section/user-page/UserPage";
import UserDetailPage from "./features/admin/user-section/user-detail-page/UserDetailPage";
import UserOverviewPage from "./features/admin/user-section/user-overview-page/UserOverviewPage";
import ActivityLogsPage from "./features/admin/user-section/activity-logs-page/ActivityLogsPage";
import WithdrawalRequestsPage from "./features/admin/withdrawal-requests/WithdrawalRequestsPage";
import TopicPage from "./features/admin/course-section/topic-section/TopicPage";
import ProfileSetupPage from "./features/user/profile-setup/ProfileSetupPage";

const router = createBrowserRouter([
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "system-settings",
        element: <SystemSettingsPage />,
      },
      {
        path: "course",
        children: [
          {
            path: "category",
            element: <CategoryPage />,
          },
          {
            path: "topic",
            element: <TopicPage />,
          },
        ]
      },
      {
        path: "user",
        children: [
          {
            index: true,
            element: <Navigate to="overview" replace />,
          },
          {
            path: "overview",
            element: <UserOverviewPage />,
          },
          {
            path: "profile",
            element: <AdminDashboard />,
          },
          {
            path: "list",
            element: <UserPage />,
          },
          {
            path: "activity-logs",
            element: <ActivityLogsPage />,
          },
          {
            path: ":userId",
            children: [
              { index: true, element: <UserDetailPage /> },
              { path: "activity-logs", element: <ActivityLogsPage /> },
            ],
          },
        ],
      },
      {
        path: "invoice/withdrawal-requests",
        element: <WithdrawalRequestsPage />,
      }
    ],
  },
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
        path: "/profile/:id",
        element: <ProfilePage />
      },
      {
        path: "/career-paths",
        element: <CareerPathPage />
      },
      {
        path: "/career-paths/:id",
        element: <CareerPathOverviewPage />
      },
      {
        path: "/user",
        element: (
          <ProtectedRoute>
            <ProfileManageLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/user/profile" replace />,
          },
          { path: "profile", element: <ProfileInfoPage /> },
          { path: "photo", element: <ProfilePhotoPage /> },
          { path: "security", element: <AccountSecurityPage /> },
        ],
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
        path: "/verify-registration",
        element: (
          <GuestRoute>
            <VerifyRegistration />
          </GuestRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <GuestRoute>
            <ResetPassword />
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
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/policy",
        element: <PolicyPage />,
      },
      {
        path: "/faq",
        element: <FAQPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/policy",
        element: <PolicyPage />,
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
      },
      {
        path: "/my-learning",
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
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
      {
        path: "roadmaps",
        element: <RoadMapsPage />,
      },
      {
        path: "performance",
        children: [
          {
            index: true,
            element: <Navigate to="overview/revenue" replace />,
          },
          {
            path: "overview",
            element: <Navigate to="revenue" replace />,
          },
          {
            path: "overview/:tab",
            element: <OverviewPage />,
          },
          {
            path: "revenue",
            element: <RevenuePage />,
          }
        ],
      },
      {
        path: "communication",
        children: [
          {
            index: true,
            element: <Navigate to="/instructor/communication/announcements" replace />,
          },
          {
            path: "announcements",
            element: <AnnouncementsPage />,
          },
          {
            path: "announcements/new",
            element: <AnnouncementComposePage />,
          },
          {
            path: "announcements/:announcementId/edit",
            element: <AnnouncementEditPage />,
          }
        ],
      }
    ],
  },
  {
    path: "/instructor/roadmaps/:roadmapId/edit",
    element:
      <ProtectedRoute>
        <RoadmapEditPage />
      </ProtectedRoute>
  },
  {
    path: "/instructor/course-preview/:courseId",
    element: (
      <ProtectedRoute>
        <InstructorCoursePreviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/personalize",
    element: (
      <ProtectedRoute>
        <ProfileSetupPage />
      </ProtectedRoute>
    ),
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
  {
    path: "/course/:courseId/learn",
    element: (
      <ProtectedRoute>
        <CourseLearnLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <CourseInitialRedirect />,
      },
      {
        path: "lecture/:contentId",
        element: <VideoPlayerPage />,
      },
      {
        path: "quiz/:contentId",
        element: <QuizPlayerPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
