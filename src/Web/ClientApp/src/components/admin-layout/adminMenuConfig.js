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
        {
          id: "course",
          title: "Course",
          type: "item",
          url: "/admin/course",
          icon: SchoolOutlinedIcon,
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
              id: "user-profile",
              title: "Profile",
              type: "item",
              url: "/admin/user/profile",
            },
            {
              id: "user-cards",
              title: "Cards",
              type: "item",
              url: "/admin/user/cards",
            },
            {
              id: "user-list",
              title: "List",
              type: "item",
              url: "/admin/user/list",
            },
            {
              id: "user-create",
              title: "Create",
              type: "item",
              url: "/admin/user/create",
            },
            {
              id: "user-edit",
              title: "Edit",
              type: "item",
              url: "/admin/user/edit",
            },
            {
              id: "user-account",
              title: "Account",
              type: "item",
              url: "/admin/user/account",
            },
          ],
        },
        {
          id: "product",
          title: "Product",
          type: "collapse",
          icon: Inventory2OutlinedIcon,
          children: [
            {
              id: "product-list",
              title: "List",
              type: "item",
              url: "/admin/product/list",
            },
            {
              id: "product-create",
              title: "Create",
              type: "item",
              url: "/admin/product/create",
            },
            {
              id: "product-edit",
              title: "Edit",
              type: "item",
              url: "/admin/product/edit",
            },
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
              id: "invoice-list",
              title: "List",
              type: "item",
              url: "/admin/invoice/list",
            },
            {
              id: "invoice-create",
              title: "Create",
              type: "item",
              url: "/admin/invoice/create",
            },
            {
              id: "invoice-details",
              title: "Details",
              type: "item",
              url: "/admin/invoice/details",
            },
          ],
        },
      ],
    },
  ],
};

export default adminMenuConfig;
