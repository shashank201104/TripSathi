import React from "react";
import { motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex items-center justify-center w-10 h-10 rounded-lg border border-theme text-text-secondary hover:text-accent hover:border-accent/40 bg-surface-elevated/50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? <FaSun className="h-4 w-4" /> : <FaMoon className="h-4 w-4" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
