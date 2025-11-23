import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from '@mui/material';

function LineChartWidget({ data, metric,aggregationLevel, height = 300 }) {
  const chartData = data.map(item => ({
    date: item.date,
    value: item.value
  }));

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    switch (aggregationLevel) {
      case 'daily':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      case 'monthly':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        });
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
    }
  };

  if (!data || data.length === 0) {
    return (
      <Box 
        sx={{ 
          width: '100%',
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#fff'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No data to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <LineChart
        xAxis={[
          {
            data: chartData.map((_, index) => index),
            scaleType: 'point',
            valueFormatter: (value) => formatDate(chartData[value].date),
          }
        ]}
        yAxis={[
          {
            min: 0,
          }
        ]}
        series={[
          {
            data: chartData.map(item => item.value),
            label: metric,
            color: "#00b190",
            curve: 'catmullRom',
            showMark: false,
          }
        ]}
        height={height}
        margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
        grid={{ vertical: true, horizontal: true }}
        sx={{
          '& .MuiLineElement-root': {
            strokeWidth: 2,
          },
          '& .MuiMarkElement-root': {
            scale: '0.8',
            fill: '#fff',
            strokeWidth: 2,
          },
        }}
      />
    </Box>
  );
}

export default LineChartWidget;