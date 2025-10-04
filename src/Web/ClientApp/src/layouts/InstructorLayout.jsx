import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import DevicesIcon from "@mui/icons-material/Devices";
import BarChartIcon from "@mui/icons-material/BarChart";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import BackpackIcon from "@mui/icons-material/Backpack";
import ChatIcon from "@mui/icons-material/Chat";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import MessageIcon from "@mui/icons-material/Message";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { Lightbulb } from "@mui/icons-material";
import { createTheme } from "@mui/material";
import theme from "../theme/theme";
import ToolbarActions from "../components/ToolbarActions";

const NAVIGATION = [
  {
    title: "Courses",
    icon: <DevicesIcon />,
    children: [
      {
        segment: "instructor/courses",
        title: "Courses",
        icon: <LibraryBooksIcon />,
      },
      {
        segment: "course-bundles",
        title: "Course Bundles",
        icon: <BackpackIcon />,
      },
    ],
  },

  {
    segment: "communication",
    title: "Communication",
    icon: <ChatIcon />,
    children: [
      {
        segment: "qna",
        title: "Q&A",
        icon: <QuestionAnswerIcon />,
      },
      {
        segment: "messages",
        title: "Message",
        icon: <MessageIcon />,
      },
      {
        segment: "assignments",
        title: "Assignments",
        icon: <AssignmentIcon />,
      },
    ],
  },
  {
    segment: "performance",
    title: "Performance",
    icon: <BarChartIcon />,
    children: [
      {
        segment: "overview",
        title: "Overview",
        icon: <BarChartIcon />,
      },
      {
        segment: "revenue",
        title: "Revenue",
        icon: <MonetizationOnRoundedIcon />,
      },
      {
        segment: "students",
        title: "Students",
        icon: <PeopleIcon />,
      },
      {
        segment: "reviews",
        title: "Reviews",
        icon: <RateReviewRoundedIcon />,
      },
    ],
  },
];

const dashboardTheme = createTheme(theme, {
  palette: {
    primary: theme.palette.brand,
    secondary: theme.palette.secondaryBrand,
  },
});

function InstructorLayout() {
  return (
    <ReactRouterAppProvider
      navigation={NAVIGATION}
      branding={{
        logo: (
          <Lightbulb
            sx={{
              color: "brand.main",
              width: 30,
              height: 30,
            }}
          />
        ),
        title: "Edunary",
        homeUrl: "/",
      }}
      theme={dashboardTheme}
    >
      <DashboardLayout
        slots={{
          toolbarActions: ToolbarActions,
        }}
      >
        <Outlet />
      </DashboardLayout>
    </ReactRouterAppProvider>
  );
}

export default InstructorLayout;
