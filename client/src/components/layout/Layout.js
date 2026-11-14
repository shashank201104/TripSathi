import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({
  children,
  fullScreen = false,
  showNavbarOnly = false,
}) => {
  const location = useLocation();

  const shouldShowFooter = location.pathname === "/";

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-bg transition-theme">
        {children || <Outlet />}
      </div>
    );
  }

  if (showNavbarOnly) {
    return (
      <div className="flex flex-col min-h-screen bg-bg transition-theme">
        <Navbar />
        <main className="flex-1">{children || <Outlet />}</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg transition-theme">
      <div className="sticky top-0 z-50 w-full">
        <Navbar />
      </div>

      <div className="flex flex-1 relative">
        <main className="flex-1 w-full min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children || <Outlet />}
          </motion.div>
        </main>
      </div>

      {shouldShowFooter && (
        <div className="w-full z-10 border-t border-border">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;
