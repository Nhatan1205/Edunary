import { useEffect, useRef } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Chatbot from "../components/chatbot/Chatbot";

function UserLayout() {
  const headerWrapperRef = useRef(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const wrapper = headerWrapperRef.current;
          if (!wrapper) {
            ticking.current = false;
            return;
          }

          if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
            // Scrolling down — hide
            wrapper.style.transform = "translateY(-100%)";
          } else {
            // Scrolling up — show
            wrapper.style.transform = "translateY(0)";
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <ScrollRestoration getKey={(location) => location.pathname} />
      <div
        ref={headerWrapperRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          transition: "transform 0.3s ease",
          willChange: "transform",
        }}
      >
        <Header />
      </div>
      <main className="mx-auto">
        <Outlet />
        <Chatbot />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
