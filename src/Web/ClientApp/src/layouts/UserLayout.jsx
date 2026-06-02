import { Outlet, ScrollRestoration } from "react-router";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Chatbot from "../components/chatbot/Chatbot";

function UserLayout() {
  return (
    <div>
      <ScrollRestoration getKey={(location) => location.pathname} />
      <Header />
      <main className="mx-auto">
        <Outlet />
        <Chatbot />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
