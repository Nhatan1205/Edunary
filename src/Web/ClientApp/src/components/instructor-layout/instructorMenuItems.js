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
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AnnouncementRoundedIcon from "@mui/icons-material/AnnouncementRounded";
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const instructorMenuItems = {
  items: [
    {
      id: "courses-group",
      title: "Courses",
      type: "group",
      children: [
        {
          id: "courses",
          title: "Courses",
          type: "item",
          url: "/instructor/courses",
          icon: LibraryBooksIcon,
        },
        {
          id: "roadmaps",
          title: "Roadmaps",
          type: "item",
          url: "/instructor/roadmaps",
          icon: MapOutlinedIcon,
        },
        {
          id: "coupons",
          title: "Coupons",
          type: "item",
          url: "/instructor/coupons",
          icon: LocalOfferIcon,
        },
        // {
        //   id: "course-bundles",
        //   title: "Course Bundles",
        //   type: "item",
        //   url: "/course-bundles",
        //   icon: BackpackIcon,
        // },
        {
          id: "invitations",
          title: "Invitations",
          type: "item",
          url: "/instructor/invitations",
          icon: MailOutlineIcon,
        },
      ],
    },
    {
      id: "communication-group",
      title: "Communication",
      type: "group",
      children: [
        {
          id: "q&a",
          title: "Q&A",
          type: "item",
          url: "/instructor/communication/qa",
          icon: QuestionAnswerIcon,
        },
        {
          id: "messages",
          title: "Message",
          type: "item",
          url: "/instructor/communication/messages",
          icon: MessageIcon,
        },
        {
          id: "assignments",
          title: "Assignments",
          type: "item",
          url: "/instructor/communication/assignments",
          icon: AssignmentIcon,
        },
        {
          id: "announcements",
          title: "Announcements",
          type: "item",
          url: "/instructor/communication/announcements",
          icon: AnnouncementRoundedIcon,
        },
      ],
    },
    {
      id: "performance-group",
      title: "Performance",
      type: "group",
      children: [
        {
          id: "overview",
          title: "Overview",
          type: "item",
          url: "/instructor/performance/overview/revenue",
          icon: BarChartIcon,
        },
        {
          id: "report",
          title: "Report",
          type: "item",
          url: "/instructor/performance/report",
          icon: AssessmentOutlinedIcon,
        },
        {
          id: "revenue",
          title: "Revenue",
          type: "item",
          url: "/instructor/performance/revenue",
          icon: MonetizationOnRoundedIcon,
        },
        {
          id: "students",
          title: "Students",
          type: "item",
          url: "/instructor/performance/students",
          icon: PeopleIcon,
        },
        {
          id: "reviews",
          title: "Reviews",
          type: "item",
          url: "/instructor/performance/reviews",
          icon: RateReviewRoundedIcon,
        },
      ],
    },
  ],
};

export default instructorMenuItems;
