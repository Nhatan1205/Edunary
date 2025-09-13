import React, { Component } from "react";
import {
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import AppRoutes from "./AppRoutes";
import Layout from "./components/Layout";
import UserLayout from "./layouts/UserLayout";
import "./custom.css";
import Home from "./components/Home";
import Counter from "./components/Counter";
import FetchData from "./components/FetchData";
import ThemeDemo from "./components/ThemeDemo";
import { ToastContainer } from "react-toastify";

const router = createBrowserRouter([
  {
    element: <UserLayout />, // layout bao ngoài
    children: [
      {
        index: true, // tương ứng với path "/"
        element: <Home />,
      },
      {
        path: "/counter",
        element: <Counter />,
      },
      {
        path: "/fetch-data",
        element: <FetchData />,
      },
      {
        path: "/theme-demo",
        element: <ThemeDemo />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
