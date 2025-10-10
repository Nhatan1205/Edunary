import { RouterProvider } from "react-router/dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./custom.css";
import { ToastContainer } from "react-toastify";
import router from "./AppRoutes";
import queryClient from "./configs/reactQuery";
import Chatbot from "./components/chatbot/Chatbot";
import { useAuth } from "./context/AuthContext";
import { SignalRProvider } from "./context/SignalRContext";

function App() {
  const { isAuthenticated } = useAuth();
  const AppContent = (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Chatbot />
      {/* <ReactQueryDevtools initialIsOpen={false}  /> */}
    </QueryClientProvider>
  );

  return isAuthenticated ? (
    <SignalRProvider>{AppContent}</SignalRProvider>
  ) : (
    AppContent
  );
}

export default App;
