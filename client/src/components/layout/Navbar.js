import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeToggle } from "../ui";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaMapMarkedAlt,
  FaPlane,
  FaRoute,
  FaChartBar,
} from "react-icons/fa";

const AppNavbar = () => {
  const { user, isAuthenticated, logout, getRemainingAiRequests } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: FaChartBar },
    { name: "Trip Planner", href: "/trip-planner", icon: FaPlane },
    { name: "My Trips", href: "/trips", icon: FaRoute },
    { name: "Maps", href: "/maps", icon: FaMapMarkedAlt },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setShowUserMenu(false);
    navigate("/");
  };

  const remainingRequests = getRemainingAiRequests();

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="app-navbar border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-bg transition-colors">
              <FaRoute className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-normal text-text-primary leading-none">
                TripSathi
              </span>
              <span className="text-[10px] text-text-secondary tracking-wider uppercase">
              Thoughtful travel
              </span>
            </div>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-accent-muted"
                  }`}
                >
                  <item.icon className="mr-2 h-3.5 w-3.5" />
                  {item.name}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {user?.planType === "free" && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-elevated border border-border font-mono text-xs">
                    <span className="text-text-secondary">AI</span>
                    <span
                      className={`font-semibold ${
                        remainingRequests <= 1 ? "text-error" : "text-accent"
                      }`}
                    >
                      {remainingRequests === -1 ? "∞" : remainingRequests}
                    </span>
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="h-8 w-8 rounded-lg bg-accent-muted border border-accent/20 flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-text-primary leading-none">
                        {user?.name}
                      </p>
                      <p className="text-[10px] font-mono text-text-secondary uppercase tracking-wider mt-0.5">
                        Standard
                      </p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-48 surface-card-elevated py-1 z-50"
                      >
                        <Link
                          to="/profile"
                          className="flex items-center w-full px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-accent-muted transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUser className="mr-3 h-4 w-4" />
                          Profile
                        </Link>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-accent-muted transition-colors"
                        >
                          <FaSignOutAlt className="mr-3 h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md hover:bg-accent-muted transition-colors">
                    Login
                </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-accent text-bg rounded-md hover:bg-accent-hover transition-colors">
                    Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            {location.pathname !== "/" && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-text-secondary hover:bg-accent-muted transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-surface"
          >
            <div className="px-4 py-3 space-y-1">
              {isAuthenticated &&
                [...userNavigation, { name: "Profile", href: "/profile", icon: FaUser }].map(
                  (item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? "text-accent bg-accent-muted"
                          : "text-text-secondary hover:text-text-primary hover:bg-accent-muted"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                )}

              {!isAuthenticated && (
                <div className="border-t border-border pt-3 space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2.5 text-base font-medium text-text-secondary hover:bg-accent-muted rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2.5 text-base font-semibold text-accent bg-accent-muted rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2.5 text-base font-medium text-text-secondary hover:bg-accent-muted rounded-md"
                >
                  <FaSignOutAlt className="mr-3 h-5 w-5" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="landing-nav" aria-label="Main navigation">
      <div className="landing-nav__inner">
        <Link to="/" className="landing-nav__brand" onClick={closeMenu}>
          <span className="landing-nav__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m3.5 18 7-12 4.2 7.1 2.2-3.4 3.6 8.3h-17Z" />
            </svg>
          </span>
          <span>TripSathi</span>
        </Link>

        <div className="landing-nav__links">
          <a href="#destinations" onClick={closeMenu}>Destinations</a>
          <a href="#journeys" onClick={closeMenu}>Journeys</a>
          <Link to="/about" onClick={closeMenu}>Why TripSathi</Link>
        </div>

        <div className="landing-nav__actions">
          <a href="#planner" className="landing-nav__plan">
            Plan a journey
          </a>
          <Link
            to="/login"
            className="landing-nav__auth-link"
            onClick={closeMenu}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="landing-nav__auth-button"
            onClick={closeMenu}
          >
            Sign up
          </Link>
        </div>

        <button
          type="button"
          className="landing-nav__toggle"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {isOpen && (
        <div className="landing-nav__mobile">
          <a href="#destinations" onClick={closeMenu}>Destinations</a>
          <a href="#journeys" onClick={closeMenu}>Journeys</a>
          <Link to="/about" onClick={closeMenu}>Why TripSathi</Link>
          <a href="#planner" className="landing-nav__mobile-plan" onClick={closeMenu}>
            Plan a journey
          </a>
          <div className="landing-nav__mobile-auth">
            <Link to="/login" onClick={closeMenu}>
              Sign in
            </Link>
            <Link to="/register" onClick={closeMenu}>
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const Navbar = ({ variant }) =>
  variant === "landing" ? <LandingNavbar /> : <AppNavbar />;

export default Navbar;
