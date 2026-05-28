import { Box, Stack } from "@mui/material";
import PageTitle from "../../../../../components/PageTitle";
import DefaultSelect from "../../../../../components/drop-down/DefaultSelect";
import { FinanceDateRange } from "../../../../admin/finance/FinancePageTabs/shared";

const ALL_OPTION = { value: "", label: "All courses" };

export default function ReportHeaderFilters({
  selectedCourseId,
  courseOptions,
  from,
  to,
  onCourseChange,
  onFromChange,
  onToChange,
}) {
  const data = [ALL_OPTION, ...courseOptions];
  const selectedItem = data.find((option) => option.value === selectedCourseId) ?? ALL_OPTION;

  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", lg: "flex-start" }}
      justifyContent="space-between"
    >
      <Box sx={{ minWidth: 0 }}>
        <PageTitle
          title="Report"
          subtitle="Track revenue, enrollment, and rating across the courses you own or collaborate on"
        />
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="flex-end"
        sx={{ flexWrap: "wrap" }}
      >
        <DefaultSelect
          data={data}
          value={[selectedItem]}
          onChange={([item]) => onCourseChange(item?.value ?? "")}
          defaultLabel="All courses"
        />

        <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
          <FinanceDateRange
            from={from}
            to={to}
            onFromChange={onFromChange}
            onToChange={onToChange}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
