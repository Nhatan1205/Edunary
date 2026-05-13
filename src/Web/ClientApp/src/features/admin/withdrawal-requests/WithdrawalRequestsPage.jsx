import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Tab,
  TablePagination,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import DataGridToolbar from "../../../components/datagrid/DataGridToolbar";
import CustomDataGrid from "../../../components/datagrid/CustomDataGrid";
import UserFilterDialog from "../user-section/activity-logs-page/components/UserFilterDialog";
import useGetAdminWithdrawalRequests from "../../../hooks/instructor-wallet-hooks/useGetAdminWithdrawalRequests";
import useHandleAdminWithdrawalRequest from "../../../hooks/instructor-wallet-hooks/useHandleAdminWithdrawalRequest";
import useGetAdminWithdrawalRequestStatusCounts from "../../../hooks/instructor-wallet-hooks/useGetAdminWithdrawalRequestStatusCounts";
import useDebounce from "../../../hooks/common/useDebounce";
import NoData from "../../../components/NoData";
import emptyMailbox from "../../../assets/images/empty-mailbox.png";

const STATUS_TABS = ["All", "Processing", "Succeeded", "Cancelled"];

const TAB_TO_STATUS = {
  Processing: 1,
  Succeeded: 0,
  Cancelled: 2,
};

const TAB_BADGE_STYLE = {
  All: { bgcolor: "text.primary", color: "#fff" },
  Processing: { bgcolor: "warning.lighter", color: "warning.dark" },
  Succeeded: { bgcolor: "success.lighter", color: "success.darker" },
  Cancelled: { bgcolor: "grey.300", color: "text.secondary" },
};

const pillInputSx = {
  height: 40,
  px: 1.5,
  borderRadius: "10px",
  border: "1.5px solid",
  borderColor: "grey.300",
  bgcolor: "grey.50",
  color: "text.primary",
  fontSize: "0.8rem",
  fontFamily: "inherit",
  outline: "none",
  minWidth: 0,
  "&::placeholder": { color: "text.secondary", opacity: 1 },
  "&:hover": { borderColor: "grey.400" },
  "&:focus": { borderColor: "brand.main" },
};

const datepickerSx = (filled) => ({
  "& .MuiOutlinedInput-root": {
    height: 40,
    borderRadius: "10px",
    fontSize: "0.8rem",
    bgcolor: "grey.50",
    color: filled ? "brand.main" : "text.secondary",
    "& fieldset": {
      borderWidth: "1.5px",
      borderColor: filled ? "brand.main" : "grey.300",
    },
    "&:hover fieldset": { borderColor: "grey.400" },
    "&.Mui-focused fieldset": { borderColor: "brand.main" },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.8rem",
    py: 0,
    color: filled ? "brand.main" : "text.secondary",
  },
  "& .MuiIconButton-root": {
    color: filled ? "brand.main" : "grey.400",
    p: 0.5,
  },
});

function StatusTabs({ activeTab, onChange, counts }) {
  return (
    <Tabs
      value={activeTab}
      onChange={(_, v) => onChange(v)}
      variant="scrollable"
      scrollButtons={false}
      sx={{
        px: 2.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        minHeight: 48,
        "& .MuiTabs-indicator": { bgcolor: "text.primary", height: 2, borderRadius: "2px 2px 0 0" },
      }}
    >
      {STATUS_TABS.map((tab) => {
        const count = counts[tab] ?? 0;
        const badgeStyle = TAB_BADGE_STYLE[tab];
        return (
          <Tab
            key={tab}
            value={tab}
            disableRipple
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: activeTab === tab ? 700 : 500,
                    fontSize: "0.875rem",
                    color: activeTab === tab ? "text.primary" : "text.secondary",
                    transition: "color 0.15s",
                  }}
                >
                  {tab}
                </Typography>
                {count > 0 && (
                  <Box
                    sx={{
                      px: 0.85,
                      py: 0.1,
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      lineHeight: "18px",
                      minWidth: 20,
                      textAlign: "center",
                      ...badgeStyle,
                    }}
                  >
                    {count}
                  </Box>
                )}
              </Box>
            }
            sx={{ minHeight: 48, px: 0, mr: 3, textTransform: "none", py: 0 }}
          />
        );
      })}
    </Tabs>
  );
}

function formatStatus(status) {
  switch (status) {
    case 0:
      return { label: "Succeeded", color: "success.darker", bgcolor: "success.lighter" };
    case 1:
      return { label: "Processing", color: "warning.darker", bgcolor: "warning.lighter" };
    case 2:
      return { label: "Cancelled", color: "error.dark", bgcolor: "error.lighter" };
    default:
      return { label: "Unknown", color: "text.secondary", bgcolor: "grey.200" };
  }
}

function formatDateTime(value) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WithdrawalRequestsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("All");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false);
  const [bankNumber, setBankNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [activeRequestId, setActiveRequestId] = useState(null);

  const debouncedBankNumber = useDebounce(bankNumber, 400);
  const debouncedBankAccountHolder = useDebounce(bankAccountHolder, 400);

  useEffect(() => {
    setPage(0);
  }, [
    debouncedBankNumber,
    debouncedBankAccountHolder,
  ]);

  const statusFilter = activeTab === "All" ? null : TAB_TO_STATUS[activeTab];

  const queryOptions = useMemo(
    () => ({
      status: statusFilter,
      fromDate: fromDate ? fromDate.toISOString() : null,
      toDate: toDate ? toDate.toISOString() : null,
      instructorName: selectedInstructor?.fullName || null,
      bankNumber: debouncedBankNumber || null,
      bankAccountHolder: debouncedBankAccountHolder || null,
    }),
    [
      statusFilter,
      fromDate,
      toDate,
      selectedInstructor,
      debouncedBankNumber,
      debouncedBankAccountHolder,
    ]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAdminWithdrawalRequests(page + 1, rowsPerPage, queryOptions);

  const { data: statusCounts } = useGetAdminWithdrawalRequestStatusCounts();

  const {
    mutateAsync: mutateStatusAsync,
    isPending: isMutating,
    isError: isMutateError,
    error: mutateError,
    reset: resetMutation,
  } = useHandleAdminWithdrawalRequest();

  const rows = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const counts = {
    All: statusCounts?.total ?? 0,
    Processing: statusCounts?.processing ?? 0,
    Succeeded: statusCounts?.succeeded ?? 0,
    Cancelled: statusCounts?.cancelled ?? 0,
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
  };

  const handleDateChange = (setter) => (value) => {
    setter(value || null);
    setPage(0);
  };

  const handleSelectInstructor = (user) => {
    setSelectedInstructor(user);
    setInstructorDialogOpen(false);
    setPage(0);
  };

  const handleClearInstructor = () => {
    setSelectedInstructor(null);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAction = async (requestId, action) => {
    resetMutation();
    setActiveRequestId(requestId);

    try {
      await mutateStatusAsync({ requestId, action });
    } finally {
      setActiveRequestId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "__index__",
        headerName: "#",
        width: 60,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const localIndex = params.api.getAllRowIds().indexOf(params.id);
          return (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {page * rowsPerPage + localIndex + 1}
            </Typography>
          );
        },
      },
      {
        field: "created",
        headerName: "Requested At",
        flex: 1.15,
        minWidth: 170,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {formatDateTime(params.row.created)}
          </Typography>
        ),
      },
      {
        field: "instructorName",
        headerName: "Instructor",
        flex: 1.3,
        minWidth: 220,
        renderCell: (params) => (
          <Stack spacing={0.25} sx={{ py: 0.5, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }} noWrap>
              {params.row.instructorName || "--"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
              {params.row.instructorEmail || "--"}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "amount",
        headerName: "Gross",
        flex: 0.95,
        minWidth: 150,
        align: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {(params.row.amount ?? 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {params.row.currency || "USD"}
          </Typography>
        ),
      },
      {
        field: "withholdingAmount",
        headerName: "Withholding",
        flex: 0.95,
        minWidth: 150,
        align: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {(params.row.withholdingAmount ?? 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {params.row.currency || "USD"}
          </Typography>
        ),
      },
      {
        field: "netAmount",
        headerName: "Net",
        flex: 0.95,
        minWidth: 150,
        align: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {(params.row.netAmount ?? 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {params.row.currency || "USD"}
          </Typography>
        ),
      },
      {
        field: "bank",
        headerName: "Bank",
        flex: 0.9,
        minWidth: 140,
      },
      {
        field: "bankNumber",
        headerName: "Account Number",
        flex: 1.1,
        minWidth: 170,
      },
      {
        field: "bankAccountHolder",
        headerName: "Account Holder",
        flex: 1.15,
        minWidth: 180,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        minWidth: 120,
        renderCell: (params) => {
          const statusInfo = formatStatus(params.row.status);
          return (
            <Chip
              size="small"
              label={statusInfo.label}
              sx={{
                height: 24,
                fontSize: "0.72rem",
                fontWeight: 700,
                borderRadius: "6px",
                color: statusInfo.color,
                bgcolor: statusInfo.bgcolor,
                border: "none",
              }}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "right",
        width: 190,
        minWidth: 190,
        renderCell: (params) => {
          const isProcessing = params.row.status === 1;
          const isRowPending = isMutating && activeRequestId === params.row.id;

          return (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: "100%" }}>
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={!isProcessing || isRowPending}
                onClick={() => handleAction(params.row.id, "approve")}
                sx={{ textTransform: "none", minWidth: 74, fontWeight: 600 }}
              >
                {isRowPending ? "..." : "Approve"}
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={!isProcessing || isRowPending}
                onClick={() => handleAction(params.row.id, "cancel")}
                sx={{ textTransform: "none", minWidth: 64, fontWeight: 600 }}
              >
                Cancel
              </Button>
            </Stack>
          );
        },
      },
    ],
    [isMutating, activeRequestId, page, rowsPerPage]
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageTitle title="Withdrawal Requests" subtitle="Review and process instructor withdrawal requests" />
      </Box>

      <CustomBreadcrumbs />

      <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Withdrawal requests list
        </Typography>
      </Box>

      {isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || "Failed to load withdrawal requests."}
        </Alert>
      ) : null}

      {isMutateError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mutateError?.message || "Failed to process withdrawal request."}
        </Alert>
      ) : null}

      <Card
        sx={{
          borderRadius: "16px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
          overflow: "hidden",
        }}
      >
        <StatusTabs activeTab={activeTab} onChange={handleTabChange} counts={counts} />

        <DataGridToolbar
          showSearch={false}
          filterDropdowns={(
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: "1 1 180px", minWidth: 160 }}>
                <Button
                  onClick={() => setInstructorDialogOpen(true)}
                  endIcon={<ArrowDropDownIcon />}
                  size="small"
                  sx={{
                    flex: 1,
                    height: 40,
                    px: 2,
                    borderRadius: "10px",
                    border: "1.5px solid",
                    borderColor: selectedInstructor ? "brand.main" : "grey.300",
                    bgcolor: "grey.50",
                    color: selectedInstructor ? "brand.main" : "text.secondary",
                    fontWeight: 500,
                    fontSize: "0.8rem",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    justifyContent: "space-between",
                    "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" },
                    "& .MuiButton-endIcon": { ml: 0.5 },
                  }}
                >
                  <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {selectedInstructor ? selectedInstructor.fullName : "All Instructors"}
                  </Box>
                </Button>
                {selectedInstructor && (
                  <Tooltip title="Clear instructor filter">
                    <IconButton
                      size="small"
                      onClick={handleClearInstructor}
                      sx={{
                        color: "grey.500",
                        borderRadius: "8px",
                        "&:hover": { color: "error.main", bgcolor: "error.lighter" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Box
                component="input"
                type="text"
                placeholder="Account Number"
                value={bankNumber}
                onChange={(e) => setBankNumber(e.target.value)}
                sx={{ ...pillInputSx, flex: "1 1 140px", minWidth: 120 }}
              />
              <Box
                component="input"
                type="text"
                placeholder="Account Holder"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                sx={{ ...pillInputSx, flex: "1 1 160px", minWidth: 140 }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DatePicker
                    value={fromDate}
                    onChange={handleDateChange(setFromDate)}
                    slotProps={{
                      textField: { size: "small", placeholder: "From date", sx: datepickerSx(!!fromDate) },
                      field: { clearable: true, onClear: () => handleDateChange(setFromDate)(null) },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>—</Typography>
                  <DatePicker
                    value={toDate}
                    onChange={handleDateChange(setToDate)}
                    slotProps={{
                      textField: { size: "small", placeholder: "To date", sx: datepickerSx(!!toDate) },
                      field: { clearable: true, onClear: () => handleDateChange(setToDate)(null) },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>
          )}
          customRightAction={
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }} noWrap>
              {totalCount.toLocaleString("en-US")} request{totalCount === 1 ? "" : "s"}
            </Typography>
          }
          onRefresh={refetch}
          isRefreshing={isFetching && !isLoading}
        />

        <CustomDataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          slots={{
            noRowsOverlay: () => (
              <NoData
                image={emptyMailbox}
                title="No withdrawal requests"
                description="There are no withdrawal requests matching your filters."
                minHeight="360px"
              />
            ),
          }}
          checkboxSelection={false}
          height={560}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#F3F4F6",
              borderBottom: "1px solid #E5E7EB",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#6B7280",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #F3F4F6",
              py: 0.5,
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "#F9FAFB",
            },
          }}
        />

        <TablePagination
          component="div"
          page={page}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid #F3F4F6",
            "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: "0.8rem",
              color: "#6B7280",
              mb: 0,
            },
            "& .MuiTablePagination-select": { fontSize: "0.8rem" },
          }}
        />
      </Card>

      <Box sx={{ height: 80 }} />

      <UserFilterDialog
        open={instructorDialogOpen}
        onClose={() => setInstructorDialogOpen(false)}
        onSelectUser={handleSelectInstructor}
      />
    </Box>
  );
}

export default WithdrawalRequestsPage;
