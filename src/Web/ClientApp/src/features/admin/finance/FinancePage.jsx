import { useState } from "react";
import {
  Box,
  Tab,
  Tabs,
} from "@mui/material";
import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import SummaryTab from "./FinancePageTabs/SummaryTab";
import LedgerTab from "./FinancePageTabs/LedgerTab";
import TaxReportTab from "./FinancePageTabs/TaxReportTab";
import RevenueTab from "./FinancePageTabs/RevenueTab";
import { financePageContainerSx } from "./FinancePageTabs/shared";

const TABS = ["Summary", "Ledger", "Tax Report", "Revenue"];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={financePageContainerSx}>
      <CustomBreadcrumbs
        heading="Finance"
        links={[
          { name: "Admin", href: "/admin/dashboard" },
          { name: "Finance" },
        ]}
      />
      <PageTitle title="Finance Dashboard" />

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        {TABS.map((label) => <Tab key={label} label={label} />)}
      </Tabs>

      {activeTab === 0 && <SummaryTab />}
      {activeTab === 1 && <LedgerTab />}
      {activeTab === 2 && <TaxReportTab />}
      {activeTab === 3 && <RevenueTab />}
    </Box>
  );
}
