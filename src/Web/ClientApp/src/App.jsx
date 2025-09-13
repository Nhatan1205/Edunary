import { RouterProvider } from "react-router-dom";
import "./custom.css";
import { ToastContainer } from "react-toastify";
import router from "./AppRoutes";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-left"
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
    </>
  );
}

export default App;
