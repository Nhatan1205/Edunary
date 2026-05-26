import { Box, FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import PageTitle from "../../../../../components/PageTitle";
import { FinanceDateRange } from "../../../../admin/finance/FinancePageTabs/shared";
import CourseOptionLabel from "./CourseOptionLabel";

export default function ReportHeaderFilters({
  selectedCourseId,
  courseOptions,
  from,
  to,
  onCourseChange,
  onFromChange,
  onToChange,
}) {
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
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 280 } }}>
          <Select
            value={selectedCourseId}
            onChange={(e) => onCourseChange(String(e.target.value))}
            displayEmpty
            renderValue={(value) => {
              if (!value) {
                return "All accessible courses";
              }

              return courseOptions.find((option) => option.value === value)?.label ?? "All accessible courses";
            }}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.light" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
            }}
          >
            <MenuItem value="">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                All accessible courses
              </Typography>
            </MenuItem>
            {courseOptions.map((course) => (
              <MenuItem key={course.value} value={course.value}>
                <CourseOptionLabel
                  title={course.label}
                  isOwner={course.isOwner}
                  isCollaborator={course.isCollaborator}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
