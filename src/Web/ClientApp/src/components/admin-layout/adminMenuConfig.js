import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

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
        // {
        //   id: "ecommerce",
        //   title: "Ecommerce",
        //   type: "item",
        //   url: "/admin/ecommerce",
        //   icon: ShoppingBagOutlinedIcon,
        // },
        // {
        //   id: "analytics",
        //   title: "Analytics",
        //   type: "item",
        //   url: "/admin/analytics",
        //   icon: BarChartOutlinedIcon,
        // },
        // {
        //   id: "banking",
        //   title: "Banking",
        //   type: "item",
        //   url: "/admin/banking",
        //   icon: AccountBalanceOutlinedIcon,
        // },
        // {
        //   id: "booking",
        //   title: "Booking",
        //   type: "item",
        //   url: "/admin/booking",
        //   icon: EventNoteOutlinedIcon,
        // },
        // {
        //   id: "file",
        //   title: "File",
        //   type: "item",
        //   url: "/admin/file",
        //   icon: InsertDriveFileOutlinedIcon,
        // },
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
            },
            {
              id: "topic",
              title: "Topic",
              type: "item",
              url: "/admin/course/topic",
            },
            {
              id: "coupons",
              title: "Coupons",
              type: "item",
              url: "/admin/coupons",
            },
            {
              id: "course-list",
              title: "List",
              type: "item",
              url: "/admin/course/list",
            },
            {
              id: "course-approvals",
              title: "Approvals",
              type: "item",
              url: "/admin/course/approvals",
            },
          ],
        },
        // {
        //   id: "order",
        //   title: "Order",
        //   type: "collapse",
        //   icon: ShoppingCartOutlinedIcon,
        //   children: [
        //     {
        //       id: "order-list",
        //       title: "List",
        //       type: "item",
        //       url: "/admin/order/list",
        //     },
        //     {
        //       id: "order-details",
        //       title: "Details",
        //       type: "item",
        //       url: "/admin/order/details",
        //     },
        //   ],
        // },
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
        {
          id: "finance",
          title: "Finance",
          type: "collapse",
          icon: AccountBalanceWalletOutlinedIcon,
          children: [
            {
              id: "finance-dashboard",
              title: "Finance Dashboard",
              type: "item",
              url: "/admin/finance/dashboard",
            },
            {
              id: "finance-payouts",
              title: "Payouts",
              type: "item",
              url: "/admin/finance/payouts",
            },
            {
              id: "finance-tax-regions",
              title: "Tax Regions",
              type: "item",
              url: "/admin/finance/tax-regions",
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
    {
      id: "ai-center-group",
      title: "AI Center",
      type: "group",
      children: [
        {
          id: "knowledge-base",
          title: "Knowledge Base",
          type: "item",
          url: "/admin/knowledge-base",
          icon: MenuBookOutlinedIcon,
        },
        {
          id: "embedding",
          title: "Embedding",
          type: "collapse",
          icon: AutoFixHighOutlinedIcon,
          children: [
            {
              id: "qdrant-dashboard",
              title: "Qdrant Dashboard",
              type: "item",
              url: "/admin/qdrant-dashboard",
            },
            {
              id: "course-embeddings",
              title: "Course Embeddings",
              type: "item",
              url: "/admin/course-embeddings",
            },
            {
              id: "user-embeddings",
              title: "User Embeddings",
              type: "item",
              url: "/admin/user-embeddings",
            },
          ],
        },
      ],
    },
  ],
};

export default adminMenuConfig;
