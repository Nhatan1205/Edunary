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
import CourseFeedbackPage from "./features/instructor/courses-management/course-manage-page/pages/course-feedback-page/CourseFeedbackPage";
import CoursesListPage from "./features/instructor/courses-management/courses-list-page/CoursesListPage";
import SearchPage from "./features/guest/search-page/SearchPage";
import MyLearning from "./features/user/my-learning/MyLearning";
import NotificationsPage from "./features/user/notifications/NotificationsPage";
import CourseLearnLayout from "./layouts/CourseLearnLayout";
import VideoPlayerPage from "./features/user/course-learn/video-player/VideoPlayer";
import QuizPlayerPage from "./features/user/course-learn/quiz-player/QuizPlayer";
import AssignmentPlayerPage from "./features/user/course-learn/assignment-player/AssignmentPlayer";
import FAQPage from "./features/guest/faq-page/FAQPage";
import AboutPage from "./features/guest/about-page/AboutPage";
import OverviewPage from "./features/instructor/performance-section/overview-page/CourseOverviewPage";
import RevenuePage from "./features/instructor/performance-section/revenue-page/RevenuePage";
import StudentsPage from "./features/instructor/performance-section/students-page/StudentsPage";
import PolicyPage from "./features/guest/policy-page/PolicyPage";
import AnnouncementsPage from "./features/instructor/communication-section/announcements-page/AnnouncementsPage";
import AnnouncementComposePage from "./features/instructor/communication-section/announcements-page/announcements-compose-page.jsx/AnnouncementComposePage";
import AnnouncementEditPage from "./features/instructor/communication-section/announcements-page/announcements-edit-page.jsx/AnnouncementEditPage";
import QADashboardPage from "./features/instructor/communication-section/qa-page/QADashboardPage";
import AssignmentDashboardPage from "./features/instructor/communication-section/assignment-dashboard/AssignmentDashboardPage";
import CourseInitialRedirect from "./features/user/my-learning/CourseInitialRedirect";
import NotFound from "./components/NotFound";
import ProfileManageLayout from "./layouts/ProfileManageLayout";
import ProfileInfoPage from "./features/user/profile/pages/ProfileInfoPage";
import ProfilePhotoPage from "./features/user/profile/pages/ProfilePhotoPage";
import AccountSecurityPage from "./features/user/profile/pages/AccountSecurityPage";
import TaxProfilePage from "./features/user/profile/pages/TaxProfilePage";
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
import KnowledgeBasePage from "./features/admin/knowledge-base/KnowledgeBasePage";
import QdrantDashboardPage from "./features/admin/qdrant-dashboard/QdrantDashboardPage";
import CourseEmbeddingPage from "./features/admin/course-embedding/CourseEmbeddingPage";
import MyCareerPathDetailPage from "./features/user/career-paths/MyCareerPathDetailPage";
import GenerateCareerPathPage from "./features/user/career-paths/generate-career-path/GenerateCareerPathPage";
import UserEmbeddingPage from "./features/admin/user-embedding/UserEmbeddingPage";
import InvitationsPage from "./features/instructor/invitations-page/InvitationsPage";
import ReviewsPage from "./features/instructor/performance-section/reviews-page/ReviewsPage";
import CouponsPage from "./features/instructor/coupons-page/CouponsPage";
import FinancePage from "./features/admin/finance/FinancePage";
import PayoutsPage from "./features/admin/finance/PayoutsPage";
import TaxRegionsPage from "./features/admin/finance/TaxRegionsPage";
import CourseApprovalsPage from "./features/admin/course-section/course-approvals/course-approvals-page/CourseApprovalsPage";
import CourseApprovalDetailPage from "./features/admin/course-section/course-approvals/course-approval-detail-page/CourseApprovalDetailPage";
import AdminCoursePreviewPage from "./features/admin/course-section/course-approvals/admin-course-preview-page/AdminCoursePreviewPage";
import CourseManagementPage from "./features/admin/course-section/course-management/CourseManagementPage";
import CourseChangesPage from "./features/admin/course-section/course-changes/CourseChangesPage";
import QualityReportPage from "./features/admin/course-section/course-approvals/quality-report-page/QualityReportPage";

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
          {
            path: "list",
            element: <CourseManagementPage />,
          },
          {
            path: ":courseId/changes",
            element: <CourseChangesPage />,
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
      },
      {
        path: "knowledge-base",
        element: <KnowledgeBasePage />,
      },
      {
        path: "qdrant-dashboard",
        element: <QdrantDashboardPage />,
      },
      {
        path: "course-embeddings",
        element: <CourseEmbeddingPage />,
      },
      {
        path: "user-embeddings",
        element: <UserEmbeddingPage />,
      },
      {
        path: "coupons",
        element: <CouponsPage isAdmin={true} />,
      },
      {
        path: "finance/dashboard",
        element: <FinancePage />,
      },
      {
        path: "finance/payouts",
        element: <PayoutsPage />,
      },
      {
        path: "finance/tax-regions",
        element: <TaxRegionsPage />,
      },
      {
        path: "course/approvals",
        element: <CourseApprovalsPage />,
      },
      {
        path: "course/approvals/:submissionId",
        element: <CourseApprovalDetailPage />,
      },
      {
        path: "course/approvals/:submissionId/report/:reportId?",
        element: <QualityReportPage />,
      },
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
          { path: "tax", element: <TaxProfilePage /> },
        ],
      },
      {
        path: "/user/notifications",
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
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

      {
        path: "/ai/career-path",
        element: (
          <ProtectedRoute>
            <GenerateCareerPathPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/career-path/:id",
        element: (
          <ProtectedRoute>
            <MyCareerPathDetailPage />
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
            path: "reviews",
            element: <ReviewsPage />,
          },
          {
            path: "revenue",
            element: <RevenuePage />,
          },
          {
            path: "students",
            element: <StudentsPage />,
          },
        ],
      },
      {
        path: "coupons",
        element: <CouponsPage />,
      },
      {
        path: "communication",
        children: [
          {
            index: true,
            element: <Navigate to="/instructor/communication/announcements" replace />,
          },
          {
            path: "qa",
            element: <QADashboardPage />,
          },
          {
            path: "assignments",
            element: <AssignmentDashboardPage />,
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
      },
      {
        path: "invitations",
        element: <InvitationsPage />,
      },
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
    path: "/admin/course/approvals/:submissionId/preview/:courseId",
    element: (
      <AdminRoute>
        <AdminCoursePreviewPage />
      </AdminRoute>
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
      {
        path: "feedback",
        element: <CourseFeedbackPage />,
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
      {
        path: "assignment/:contentId",
        element: <AssignmentPlayerPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
