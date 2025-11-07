import { Alert } from "@mui/material";

function ValidationAlert({ severity = 'error',message}) {
  if (!message) return null;
  
  return (
    <Alert
      severity={severity}
      variant='outlined'
      sx={{borderRadius: 2, color: "text.primary", my: 1 }}
    >
      {message}
    </Alert>
  );
};

export default ValidationAlert;