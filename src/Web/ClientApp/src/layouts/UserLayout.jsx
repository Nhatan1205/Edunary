import { Outlet } from "react-router";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Chatbot from "../components/chatbot/Chatbot";

function UserLayout() {
  return (
    <div>
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
