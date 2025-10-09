import { Outlet } from "react-router";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import { useEffect } from "react";
import { connection, start } from "../signalr/signalrConnection";
import { toast } from "react-toastify";

function UserLayout() {
  useEffect(() => {
    start();

    connection.on("ReceiveMessage", (user, message) => {
      toast.success(`${user}: ${message}`);
    });

    return () => {
      connection.off("ReceiveMessage");
    };
  }, []);
  return (
    <div>
      <Header />
      <main className="mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
