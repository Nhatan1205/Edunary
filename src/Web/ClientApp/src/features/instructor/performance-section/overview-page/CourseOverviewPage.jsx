import { Container, Row, Col } from 'reactstrap';
import {
  Paper,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import PageTitle from '../../../../components/PageTitle';
import MetricTab from './MetricTab';
import DefaultSelect from '../../../../components/drop-down/DefaultSelect';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import LineChartWidget from '../../../../components/charts/LineChartWidget';
import useGetCoursesAuthor from '../../../../hooks/useGetCoursesAuthor';
import useGetCourseStats from '../../../../hooks/useGetCourseStats';
import BarChartWidget from '../../../../components/charts/BarChartWidget';

const dateFilterData = [
  { label: "Last 7 days", value: "week" },
  { label: "Last 30 days", value: "month" },
  { label: "Last 12 months", value: "year" },
  { label: "All time", value: "all" },
];

function CourseOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tab } = useParams();
  const navigate = useNavigate();
  const { data: coursesData } =
    useGetCoursesAuthor("", 2, 1, 1000);

  const courseIdParam = searchParams.getAll("course_id")
    .map(val => {
      const course = coursesData?.items?.find(course => String(course.id) === val);
      return course ? { label: course.title, value: course.id } : null;
    })
    .filter(Boolean);

  const dateParam = searchParams.getAll("date_filter")
    .map(val => dateFilterData.find(item => item.value === val))
    .filter(Boolean);

  // --------- Fetch course stats ---------
  const selectedCourseId = courseIdParam?.[0]?.value || null;
  const selectedDateRange = dateParam?.[0]?.value || "last_12_months";
  const { data: courseStats, isLoading: isStatsLoading } = useGetCourseStats(
    selectedCourseId,
    selectedDateRange,
    tab
  );

  // ------------------
  function handleTabClick(newTab) {
    const params = searchParams.toString();
    navigate(`/instructor/performance/overview/${newTab}/?${params}`);
  }


  function updateQueryParam(key, selectedItems) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(key);

    if (selectedItems && selectedItems.length > 0) {
      selectedItems.forEach(item => {
        if (item.value === null || item.value === "") {
          params.append(key, "");
        } else {
          params.append(key, item.value);
        }
      });
    }

    setSearchParams(params);
  };

  const getMetricLabel = (metric) => ({
    revenue: 'Revenue ($)',
    enrollment: 'Total Enrollments',
    rating: 'Rating'
  }[metric] || 'Value');


  return (
    <Container fluid>
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        flexDirection={{ xs: "column", md: "row" }}
        mb={2}
        gap={4}
      >
        <PageTitle
          title="Overview"
          subtitle="Get top insights about your performance"
        />

        <DefaultSelect
          data={[
            { label: "All courses", value: null },
            ...(coursesData?.items?.map(course => ({
              label: course.title,
              value: course.id
            })) || [])
          ]}
          value={courseIdParam}
          onChange={selected => updateQueryParam('course_id', selected)}
          defaultLabel="All courses"
        />
      </Box>
      <Row>
        <Col md={12}>
          <Paper variant="outlined" sx={{ borderRadius: 0, mb: 4, borderColor: '#d1d7dc', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>

            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} sx={{ px: 2, gap: 1 }}>
              <MetricTab
                label="This month so far"
                value={`$ 0`}
                subValue="$0.00 total revenue"
                active={tab === 'revenue'}
                onClick={() => handleTabClick('revenue')}
              />
              <MetricTab
                label="This month so far"
                tooltip="This is the number of enrollments across your published and unpublished courses for this month so far. For example, if a student enrolled in two of your courses during this month, that student counts for two enrollments."
                value={`${courseStats?.summary?.totalEnrollmentsThisMonth || 0}`}
                subValue={`${courseStats?.summary?.totalEnrollments || 0} total enrollments`}
                active={tab === 'enrollment'}
                onClick={() => handleTabClick('enrollment')}
              />
              <MetricTab
                label="This month so far"
                tooltip="Ratings are calculated from individual students' ratings and a variety of other signals, like age of rating and reliability, to ensure that they reflect course quality fairly and accurately."
                value={`${Number(courseStats?.summary?.averageRatingThisMonth || 0).toFixed(2)}`}
                subValue={`${Number(courseStats?.summary?.averageRating || 0).toFixed(2)} average ratings`}
                active={tab === 'rating'}
                onClick={() => handleTabClick('rating')}
              />
            </Box>
            <Divider />

            {/* Filter Bar */}
            <Box
              p={2}
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              mr={2}
            >
              <Typography variant="body2" color="text.secondary">
                Date range:
              </Typography>
              <DefaultSelect
                data={dateFilterData}
                value={dateParam}
                onChange={selected => updateQueryParam('date_filter', selected)}
                defaultLabel="All time"
              />
              {/* <Button 
                variant="contained" 
                endIcon={<KeyboardArrowDownIcon />}
                sx={{ 
                  backgroundColor: 'brand.main', // Edunary purple style
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 0,
                  '&:hover': { backgroundColor: 'brand.dark' }
                }}
              >
                Export
              </Button> */}
            </Box>

            {/* Chart / Empty State Area */}
            <Box
              sx={{
                height: 440,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fff',
                mr: 2,
              }}
            >
              {isStatsLoading ? (
                <Typography variant="body1" color="text.secondary">
                  Loading...
                </Typography>
              ) : (
                <>
                  {(tab === "enrollment" || tab === "revenue") ? (
                    <LineChartWidget
                      data={courseStats?.stats?.data || []}
                      metric={getMetricLabel(courseStats?.stats?.metric)}
                      aggregationLevel={courseStats?.stats?.aggregationLevel}
                      height={440}
                    />
                  ) : (
                    <BarChartWidget
                      data={courseStats?.stats?.data || []}
                      metric={getMetricLabel(courseStats?.stats?.metric)}
                      height={440}
                    />
                  )}
                </>
              )}
            </Box>

            <Divider />

            {/* Footer Link */}
            <Box p={2} display="flex" justifyContent="center">
              <Typography variant="body2" color="text.secondary">
                All data is updated daily. For detailed insights, check individual course reports.
              </Typography>
            </Box>

          </Paper>
        </Col>
      </Row>
    </Container>
  );
}

export default CourseOverviewPage;