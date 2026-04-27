import {
  Paper,
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  InputBase,
  InputAdornment,
  Tooltip,
  IconButton,
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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useMemo, useState } from 'react';
import useGetCoursesAuthor from '../../../../../hooks/course-hooks/useGetCoursesAuthor';
import useGetInstructorWalletTransactions from '../../../../../hooks/instructor-wallet-hooks/useGetInstructorWalletTransactions';
import NoData from '../../../../../components/NoData';
import emptyMailbox from '../../../../../assets/images/empty-mailbox.png';

function WithdrawalHistory() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('purchase');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [orderId, setOrderId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [amountSort, setAmountSort] = useState(null); // 'asc' | 'desc' | null
  const [typeMenuAnchor, setTypeMenuAnchor] = useState(null);
  const [courseMenuAnchor, setCourseMenuAnchor] = useState(null);

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

  useEffect(() => {
    if (isWithdrawalView) {
      setCourseMenuAnchor(null);
    }
  }, [isWithdrawalView]);

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
        return 'Processing';
      case 2:
        return 'Cancelled';
      case 0:
        return 'Succeeded';
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
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.divider}`
        })}
      >
        {/* Row 1: Title */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ px: 3, pt: 3, pb: 2 }}
        >
          <HistoryIcon sx={{ color: (theme) => theme.palette.brand.main, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Transaction history
          </Typography>
        </Box>

        {/* Row 2: Filter bar */}
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          sx={(theme) => ({
            px: 3,
            pb: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            pt: 2,
          })}
        >
          {/* Type filter */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button
              onClick={(e) => setTypeMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDownIcon />}
              size="small"
              sx={{
                height: 40,
                px: 2,
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: isWithdrawalView ? 'brand.main' : 'grey.300',
                bgcolor: 'grey.50',
                color: isWithdrawalView ? 'brand.main' : 'text.secondary',
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: 'grey.100', borderColor: 'grey.400' },
              }}
            >
              {type === 'withdrawal' ? 'Withdrawals' : 'Course purchases'}
            </Button>
            {isWithdrawalView && (
              <Tooltip title="Clear type filter">
                <IconButton
                  size="small"
                  onClick={() => setType('purchase')}
                  sx={{
                    color: 'grey.500',
                    borderRadius: '8px',
                    '&:hover': { color: 'error.main', bgcolor: 'error.lighter' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Menu
            anchorEl={typeMenuAnchor}
            open={Boolean(typeMenuAnchor)}
            onClose={() => setTypeMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  mt: 0.5,
                  minWidth: 180,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  boxShadow: '0px 4px 6px -2px rgba(16,24,40,0.05), 0px 12px 16px -4px rgba(16,24,40,0.10)',
                  overflow: 'hidden',
                },
              },
            }}
          >
            <MenuItem
              selected={type === 'purchase'}
              onClick={() => { setType('purchase'); setTypeMenuAnchor(null); }}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                ...(type === 'purchase' && { color: 'brand.main', bgcolor: 'background.muted !important' }),
              }}
            >
              Course purchases
            </MenuItem>
            <MenuItem
              selected={type === 'withdrawal'}
              onClick={() => { setType('withdrawal'); setTypeMenuAnchor(null); }}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                ...(type === 'withdrawal' && { color: 'brand.main', bgcolor: 'background.muted !important' }),
              }}
            >
              Withdrawals
            </MenuItem>
          </Menu>

          {/* Date range */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="input"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              title="From date"
              sx={{
                height: 40,
                px: 1.5,
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: fromDate ? 'brand.main' : 'grey.300',
                bgcolor: 'grey.50',
                color: fromDate ? 'brand.main' : 'text.secondary',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                outline: 'none',
                '&:focus': { borderColor: 'brand.main' },
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>—</Typography>
            <Box
              component="input"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              title="To date"
              sx={{
                height: 40,
                px: 1.5,
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: toDate ? 'brand.main' : 'grey.300',
                bgcolor: 'grey.50',
                color: toDate ? 'brand.main' : 'text.secondary',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                outline: 'none',
                '&:focus': { borderColor: 'brand.main' },
              }}
            />
          </Box>

          {/* Order ID filter */}
          {!isWithdrawalView && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                width: 110,
                height: 40,
                px: 1.5,
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: orderId ? 'brand.main' : 'grey.300',
                bgcolor: 'grey.50',
                transition: 'all 0.18s ease',
                '&:focus-within': {
                  bgcolor: 'background.paper',
                  borderColor: 'brand.main',
                  boxShadow: '0 0 0 3px rgba(0,167,111,0.10)',
                },
              }}
            >
              <InputAdornment position="start" disablePointerEvents>
                <Typography variant="caption" sx={{ color: orderId ? 'brand.main' : 'grey.400', fontWeight: 600, lineHeight: 1 }}>
                  #
                </Typography>
              </InputAdornment>
              <InputBase
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order"
                inputProps={{ min: 1, type: 'number' }}
                sx={{
                  fontSize: '0.875rem',
                  color: orderId ? 'brand.main' : 'text.primary',
                  width: '100%',
                  '& input::placeholder': { color: 'grey.400', opacity: 1 },
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                  },
                  '& input[type=number]': { MozAppearance: 'textfield' },
                }}
              />
            </Box>
          )}

          {/* Course filter */}
          {!isWithdrawalView && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Button
                onClick={(e) => setCourseMenuAnchor(e.currentTarget)}
                endIcon={<ArrowDropDownIcon />}
                size="small"
                sx={{
                  height: 40,
                  px: 2,
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: courseId ? 'brand.main' : 'grey.300',
                  bgcolor: 'grey.50',
                  color: courseId ? 'brand.main' : 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '&:hover': { bgcolor: 'grey.100', borderColor: 'grey.400' },
                }}
              >
                {courseId
                  ? (courseOptions.find((c) => String(c.id) === courseId)?.title || 'Course')
                  : 'All courses'}
              </Button>
              {courseId && (
                <Tooltip title="Clear course filter">
                  <IconButton
                    size="small"
                    onClick={() => setCourseId('')}
                    sx={{
                      color: 'grey.500',
                      borderRadius: '8px',
                      '&:hover': { color: 'error.main', bgcolor: 'error.lighter' },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          {!isWithdrawalView && (
            <Menu
              anchorEl={courseMenuAnchor}
              open={Boolean(courseMenuAnchor)}
              onClose={() => setCourseMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    mt: 0.5,
                    minWidth: 220,
                    maxHeight: 300,
                    overflowY: 'auto',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    boxShadow: '0px 4px 6px -2px rgba(16,24,40,0.05), 0px 12px 16px -4px rgba(16,24,40,0.10)',
                    overflow: 'hidden auto',
                  },
                },
              }}
            >
              <MenuItem
                selected={courseId === ''}
                onClick={() => { setCourseId(''); setCourseMenuAnchor(null); }}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  ...(courseId === '' && { color: 'brand.main', bgcolor: 'background.muted !important' }),
                }}
              >
                All courses
              </MenuItem>
              {courseOptions.map((c) => (
                <MenuItem
                  key={c.id}
                  selected={String(c.id) === courseId}
                  onClick={() => { setCourseId(String(c.id)); setCourseMenuAnchor(null); }}
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    maxWidth: 300,
                    whiteSpace: 'normal',
                    ...(String(c.id) === courseId && { color: 'brand.main', bgcolor: 'background.muted !important' }),
                  }}
                >
                  {c.title || '(Untitled)'}
                </MenuItem>
              ))}
            </Menu>
          )}
        </Box>
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
                <TableCell colSpan={isWithdrawalView ? 4 : 5} sx={{ p: 0, border: 'none' }}>
                  <NoData
                    image={emptyMailbox}
                    title="No transactions found"
                    description="There are no transactions matching your filters."
                    minHeight="320px"
                  />
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
