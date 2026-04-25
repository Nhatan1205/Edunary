import "bootstrap/dist/css/bootstrap.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider } from "@emotion/react";
import theme from "./theme/theme";
import { CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AuthProvider } from "./context/AuthContext";
import { setupApiInterceptor } from "./utils/apiInterceptor";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Key from "./configs/sso_key.json";
const GOOGLE_CLIENT_ID = Key.clientIdGoogle;
// Setup API interceptor for token management
setupApiInterceptor();

//const baseUrl = document.getElementsByTagName("base")[0].getAttribute("href");
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <AuthProvider>
            <App />
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </>,
);
serviceWorkerRegistration.unregister();

reportWebVitals();
