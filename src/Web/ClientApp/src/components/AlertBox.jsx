import { Alert, AlertTitle } from "@mui/material";

const severityStyles = {
  success: {
    bgcolor: "success.lighter",
    borderColor: "success.main",
    "& .MuiAlert-icon": { color: "success.main" },
  },
  warning: {
    bgcolor: "warning.lighter",
    borderColor: "warning.main",
    "& .MuiAlert-icon": { color: "warning.main" },
  },
  error: {
    bgcolor: "error.lighter",
    borderColor: "error.main",
    "& .MuiAlert-icon": { color: "error.main" },
  },
  info: {
    borderColor: "info.main",
    "& .MuiAlert-icon": { color: "info.main" },
  },
};

function AlertBox({ severity = 'error', variant = 'outlined', title = null, sx = {}, children }) {
  return (
    <Alert
      severity={severity}
      variant={variant}
      sx={{ borderRadius: 2, color: "text.primary", my: 1, ...severityStyles[severity], ...sx }}
    >
      {title && <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>}
      {children}
    </Alert>
  );
};

export default AlertBox;