import { Box, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function MetricTab({ label, tooltip = "", value, subValue, active, onClick }){
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        minWidth: '150px',
        p: 2,
        borderBottom: active ? '4px solid #2d2f31' : '4px solid transparent',
        opacity: active ? 1 : 0.7,
        '&:hover': {
          opacity: 1,
          backgroundColor: '#f7f9fa'
        },
        transition: 'all 0.2s'
      }}
    >
      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {tooltip &&
            <Tooltip title={tooltip || ""} arrow>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Tooltip>
        }
      </Box>
      
      <Typography variant="h4" component="div" sx={{ fontWeight: 400, mb: 0.5 }}>
        {value}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {subValue}
      </Typography>
    </Box>
  );
};

export default MetricTab;