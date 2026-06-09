import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";
import { Button } from "../components/ui";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" />
      <div className="max-w-md w-full text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="section-label mb-4"
          >
            Error
          </motion.p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-8xl md:text-9xl font-display font-bold text-accent mb-4"
          >
            404
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-3">
            Page not found
          </h1>

          <p className="text-text-secondary mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist. It may have been moved,
            deleted, or the URL may be incorrect.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button variant="primary" className="w-full sm:w-auto" icon={FaHome}>
                Go Home
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              icon={FaArrowLeft}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
