import {
  Paper,
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Pagination,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { useEffect, useMemo, useState } from 'react';
import useGetCoursesAuthor from '../../../../../hooks/course-hooks/useGetCoursesAuthor';
import useGetInstructorWalletTransactions from '../../../../../hooks/instructor-wallet-hooks/useGetInstructorWalletTransactions';

function WithdrawalHistory() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('purchase');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [orderId, setOrderId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [amountSort, setAmountSort] = useState(null); // 'asc' | 'desc' | null

  const isWithdrawalView = type === 'withdrawal';

  const { data: coursesData } = useGetCoursesAuthor('', 0, 1, 1000);
  const courses = coursesData?.items ?? [];
  const courseTitleById = useMemo(() => {
    return courses.reduce((acc, c) => {
      if (c?.id != null) {
        acc[c.id] = c.title || '(Untitled)';
      }
      return acc;
    }, {});
  }, [courses]);

  const courseOptions = useMemo(() => {
    return courses
      .filter((c) => c?.id != null)
      .slice()
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }, [courses]);

  const itemsPerPage = 10;
  const options = useMemo(() => {
    return {
      type,
      fromDate: fromDate ? new Date(fromDate) : null,
      toDate: toDate ? new Date(toDate) : null,
      orderId: isWithdrawalView ? null : (orderId ? Number(orderId) : null),
      courseId: isWithdrawalView ? null : (courseId ? Number(courseId) : null),
      amountSort: amountSort || null,
    };
  }, [type, fromDate, toDate, orderId, courseId, amountSort, isWithdrawalView]);

  useEffect(() => {
    setPage(1);
  }, [type, fromDate, toDate, orderId, courseId, amountSort]);

  const { data } = useGetInstructorWalletTransactions(page, itemsPerPage, options);

  const transactions = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currencySymbol = '$';

  const formatDate = (dateValue) => {
    const date = new Date(dateValue);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatWithdrawalStatus = (statusValue) => {
    switch (statusValue) {
      case 1:
        return 'Đang xử lý';
      case 2:
        return 'Đã hủy';
      case 0:
        return 'Thành công';
      default:
        return '--';
    }
  };

  const toggleAmountSort = () => {
    setAmountSort((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={2}
        sx={(theme) => ({
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`
        })}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <HistoryIcon sx={{ color: (theme) => theme.palette.brand.main, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Transaction history
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="flex-end" useFlexGap>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="transaction-type-label">Type</InputLabel>
            <Select
              labelId="transaction-type-label"
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="purchase">Course purchases</MenuItem>
              <MenuItem value="withdrawal">Withdrawals</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="From"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            size="small"
            type="date"
            label="To"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {!isWithdrawalView && (
            <TextField
              size="small"
              type="number"
              label="Order"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              inputProps={{ min: 1 }}
            />
          )}

          {!isWithdrawalView && (
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="transaction-course-label">Course</InputLabel>
              <Select
                labelId="transaction-course-label"
                label="Course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <MenuItem value="">All courses</MenuItem>
                {courseOptions.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.title || '(Untitled)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={(theme) => ({ bgcolor: theme.palette.background.muted })}>
              <TableCell sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
                Date
              </TableCell>
              <TableCell sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
                <TableSortLabel
                  active={Boolean(amountSort)}
                  direction={amountSort || 'asc'}
                  onClick={toggleAmountSort}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              {isWithdrawalView ? (
                <TableCell sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
                  Status
                </TableCell>
              ) : (
                <>
                  <TableCell sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
                    Order
                  </TableCell>
                  <TableCell sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
                    Course
                  </TableCell>
                </>
              )}
              <TableCell sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
                Currency
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((item) => {
                return (
                  <TableRow
                    key={item.id}
                    sx={(theme) => ({
                      '&:hover': { bgcolor: theme.palette.background.alt },
                      borderBottom: `1px solid ${theme.palette.divider}`
                    })}
                  >
                    <TableCell sx={(theme) => ({ color: theme.palette.text.primary, fontWeight: 500 })}>
                      {item.created ? formatDate(item.created) : '--'}
                    </TableCell>
                    <TableCell sx={(theme) => ({ color: theme.palette.brand.main, fontWeight: 600 })}>
                      {currencySymbol}{(item.amount ?? 0).toLocaleString('en-US')}
                    </TableCell>
                    {isWithdrawalView ? (
                      <TableCell sx={(theme) => ({ color: theme.palette.text.primary, fontWeight: 600 })}>
                        {formatWithdrawalStatus(item.status)}
                      </TableCell>
                    ) : (
                      <>
                        <TableCell sx={(theme) => ({ color: theme.palette.text.primary })}>
                          {item.orderId && item.orderId > 0 ? item.orderId : '--'}
                        </TableCell>
                        <TableCell sx={(theme) => ({ color: theme.palette.text.primary })}>
                          {item.courseId && item.courseId > 0
                            ? (courseTitleById[item.courseId] || '--')
                            : '--'}
                        </TableCell>
                      </>
                    )}
                    <TableCell sx={(theme) => ({ color: theme.palette.text.primary })}>
                      {item.currency || 'USD'}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={isWithdrawalView ? 4 : 5} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={(theme) => ({ color: theme.palette.text.disabled })}>
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          sx={(theme) => ({
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`
          })}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="standard"
            sx={(theme) => ({
              '& .MuiPaginationItem-root': {
                color: theme.palette.text.primary
              },
              '& .MuiPaginationItem-root.Mui-selected': {
                bgcolor: theme.palette.brand.main,
                color: theme.palette.background.inverse,
                '&:hover': {
                  bgcolor: theme.palette.brand.dark
                }
              }
            })}
          />
        </Box>
      )}
    </Paper>
  );
}

export default WithdrawalHistory;
