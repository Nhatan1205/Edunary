import { Alert, AlertTitle } from "@mui/material";

function AlertBox({ severity = 'error',variant='outlined', title = null, sx = {}, children }) {
  return (
    <Alert
      severity={severity}
      variant={variant}
      sx={{borderRadius: 2, color: "text.primary", my: 1, ...sx }}
    >
      {title && <AlertTitle sx={{fontWeight: 600}}>{title}</AlertTitle>}
      {children}
    </Alert>
  );
};

export default AlertBox;