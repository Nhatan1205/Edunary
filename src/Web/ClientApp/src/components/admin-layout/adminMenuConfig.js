import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const adminMenuConfig = {
  items: [
    {
      id: "overview-group",
      title: "Overview",
      type: "group",
      children: [
        {
          id: "app",
          title: "Dashboard",
          type: "item",
          url: "/admin/dashboard",
          icon: DashboardOutlinedIcon,
        },
        {
          id: "ecommerce",
          title: "Ecommerce",
          type: "item",
          url: "/admin/ecommerce",
          icon: ShoppingBagOutlinedIcon,
        },
        {
          id: "analytics",
          title: "Analytics",
          type: "item",
          url: "/admin/analytics",
          icon: BarChartOutlinedIcon,
        },
        {
          id: "banking",
          title: "Banking",
          type: "item",
          url: "/admin/banking",
          icon: AccountBalanceOutlinedIcon,
        },
        {
          id: "booking",
          title: "Booking",
          type: "item",
          url: "/admin/booking",
          icon: EventNoteOutlinedIcon,
        },
        {
          id: "file",
          title: "File",
          type: "item",
          url: "/admin/file",
          icon: InsertDriveFileOutlinedIcon,
        },
      ],
    },
    {
      id: "management-group",
      title: "Management",
      type: "group",
      children: [
        {
          id: "user",
          title: "User",
          type: "collapse",
          icon: PersonOutlineOutlinedIcon,
          children: [
            {
              id: "user-overview",
              title: "Overview",
              type: "item",
              url: "/admin/user/overview",
            },
            {
              id: "user-list",
              title: "List",
              type: "item",
              url: "/admin/user/list",
            },
            {
              id: "activity-logs",
              title: "Activity Logs",
              type: "item",
              url: "/admin/user/activity-logs",
            },
          ],
        },
        {
          id: "course",
          title: "Course",
          type: "collapse",
          icon: SchoolOutlinedIcon,
          children: [
            {
              id: "category",
              title: "Category",
              type: "item",
              url: "/admin/course/category",
            }
          ],
        },
        {
          id: "order",
          title: "Order",
          type: "collapse",
          icon: ShoppingCartOutlinedIcon,
          children: [
            {
              id: "order-list",
              title: "List",
              type: "item",
              url: "/admin/order/list",
            },
            {
              id: "order-details",
              title: "Details",
              type: "item",
              url: "/admin/order/details",
            },
          ],
        },
        {
          id: "invoice",
          title: "Invoice",
          type: "collapse",
          icon: ReceiptLongOutlinedIcon,
          children: [
            {
              id: "withdrawal-requests",
              title: "Withdrawal Requests",
              type: "item",
              url: "/admin/invoice/withdrawal-requests",
            },
          ],
        },
      ],
    },
    {
      id: "settings-group",
      title: "Settings",
      type: "group",
      children: [
        {
          id: "system-settings",
          title: "System Settings",
          type: "item",
          url: "/admin/system-settings",
          icon: SettingsOutlinedIcon,
        },
      ],
    },
  ],
};

export default adminMenuConfig;
