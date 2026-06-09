import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaChartBar,
  FaPlane,
  FaMapMarkedAlt,
  FaRoute,
  FaUsers,
  FaDatabase,
  FaFileAlt,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Sidebar = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: FaChartBar, description: "Overview & analytics" },
    { name: "Trip Planner", href: "/trip-planner", icon: FaPlane, description: "Plan your adventure" },
    { name: "My Trips", href: "/trips", icon: FaRoute, description: "View all trips" },
    { name: "Maps", href: "/maps", icon: FaMapMarkedAlt, description: "Explore destinations" },
  ];

  const adminNavigation = [
    { name: "Admin Panel", href: "/admin", icon: FaDatabase, description: "System management" },
    { name: "User Management", href: "/admin/users", icon: FaUsers, description: "Manage users" },
    { name: "Analytics", href: "/admin/analytics", icon: FaChartBar, description: "Platform insights" },
    { name: "Content Management", href: "/admin/content", icon: FaFileAlt, description: "Manage content" },
  ];

  const currentNavigation = hasPermission("admin")
    ? [...userNavigation, ...adminNavigation]
    : userNavigation;

  const NavItem = ({ item, isActive, index }) => (
    <motion.div
      key={item.name}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        to={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 border-l-2 ${
          isActive
            ? "border-l-accent bg-accent-muted text-accent"
            : "border-l-transparent text-text-secondary hover:text-text-primary hover:bg-accent-muted/50"
        }`}
      >
        <item.icon
          className={`mr-3 h-4 w-4 flex-shrink-0 ${
            isActive ? "text-accent" : "text-text-secondary group-hover:text-text-primary"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-text-secondary/70 truncate">{item.description}</div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-[4.25rem] left-4 z-50 p-2.5 bg-accent text-bg rounded-md shadow-medium border border-accent/20 hover:brightness-110 transition-all"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`
          fixed lg:relative top-0 left-0 z-40
          h-full w-72
          bg-surface border-r border-border
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 mb-3 flex justify-between items-center">
              <span className="section-label">Navigation</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden text-text-secondary hover:text-text-primary p-1"
                aria-label="Close sidebar"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            {currentNavigation.map((item, index) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={location.pathname === item.href}
                index={index}
              />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <Link
            to="/trip-planner"
            onClick={() => setIsMobileOpen(false)}
            className="w-full flex items-center justify-center px-4 py-3 rounded-md text-sm font-semibold text-bg bg-accent hover:brightness-110 transition-all shadow-glow"
          >
            <FaPlane className="mr-2 h-4 w-4" />
            Plan New Trip
          </Link>

          <Link
            to="/profile"
            onClick={() => setIsMobileOpen(false)}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium text-text-secondary border border-border hover:border-accent/30 hover:text-text-primary hover:bg-accent-muted transition-all"
          >
            <FaUser className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
