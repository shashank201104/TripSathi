import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShieldAlt, FaRocket } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-surface border-t border-border py-10 lg:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 mb-8 lg:mb-12"
        >
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-display font-bold text-text-primary mb-3">
              Trip<span className="text-accent">Sathi</span>
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Your intelligent travel companion. Plan smarter, explore better.
            </p>
          </div>

          <div>
            <h4 className="section-label mb-4">Quick Links</h4>
            <div className="space-y-1">
              {[
                { name: "Destinations", to: "/destinations/" },
                { name: "Travel Guides", to: "/blog/" },
                { name: "Plan a Trip", to: "/plan/" },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  className="block text-sm text-text-secondary hover:text-accent py-1.5 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="section-label mb-4">Resources</h4>
            <div className="space-y-1">
              {[
                { name: "About TripSathi", to: "/about/" },
                { name: "Contact", to: "/contact/" },
                { name: "Privacy Policy", to: "/privacy/" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="block text-sm text-text-secondary hover:text-accent py-1.5 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-xs font-mono">
            &copy; {new Date().getFullYear()} TripSathi
          </p>
          <div className="flex items-center gap-6 text-xs text-text-secondary">
            <span className="flex items-center gap-2">
              <FaShieldAlt className="h-3.5 w-3.5 text-success" />
              Secure
            </span>
            <span className="flex items-center gap-2">
              <FaRocket className="h-3.5 w-3.5 text-accent" />
              AI Powered
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
