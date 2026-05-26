import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import { fmt } from "../../../admin/finance/FinancePageTabs/shared";

export const REVENUE_REPORT_PERMISSION = 64;

export function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(1);
  from.setMonth(from.getMonth() - 11);
  return {
    from: formatDateInputValue(from),
    to: formatDateInputValue(to),
  };
}

export function getSummaryCards(reportData, totalRatings) {
  return [
    {
      key: "grossRevenue",
      label: "Gross Revenue",
      value: fmt(reportData?.summary?.grossRevenue),
      helper: "Gross sales from completed orders",
      color: "#1890FF",
      Icon: AttachMoneyOutlinedIcon,
    },
    {
      key: "walletEarnings",
      label: "Wallet Earnings",
      value: fmt(reportData?.summary?.walletEarnings),
      helper: "Instructor wallet credits in the selected range",
      color: "#00A76F",
      Icon: AccountBalanceWalletOutlinedIcon,
    },
    {
      key: "enrollments",
      label: "Enrollments",
      value: Number(reportData?.summary?.totalEnrollments ?? 0).toLocaleString("en-US"),
      helper: "Total enrollments across accessible courses",
      color: "#8E33FF",
      Icon: SchoolOutlinedIcon,
    },
    {
      key: "rating",
      label: "Average Rating",
      value: Number(reportData?.summary?.averageRating ?? 0).toFixed(2),
      helper: `${totalRatings.toLocaleString("en-US")} rating${totalRatings === 1 ? "" : "s"} in the selected range`,
      color: "#B78103",
      Icon: StarOutlinedIcon,
    },
  ];
}
