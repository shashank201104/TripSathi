import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import { Button, Input, Card } from "../../components/ui";
import {
  FaRoute,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaShieldAlt,
  FaRocket,
} from "react-icons/fa";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const { values, errors, handleChange, handleBlur, isValid } =
    useFormValidation(
      { name: "", email: "", password: "", confirmPassword: "" },
      {
        name: { required: true, minLength: 2 },
        email: { required: true, email: true },
        password: {
          required: true,
          validate: (value) => {
            if (!value) return "Password is required";
            if (value.length < 8) return "Password must be at least 8 characters";
            if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
            if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
            if (!/\d/.test(value)) return "Password must contain at least one number";
            if (!/[@$!%*?&]/.test(value)) return "Password must contain at least one special character (@$!%*?&)";
            return null;
          },
        },
        confirmPassword: {
          required: true,
          validate: (value, allValues) => {
            if (!allValues || !allValues.password) return null;
            return value === allValues.password ? null : "Passwords do not match";
          },
        },
      }
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const result = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      if (result.success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 border-r border-border">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <div className="relative max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent-muted border border-accent/20 flex items-center justify-center">
              <FaRoute className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary">TripSathi</h2>
              <p className="text-xs font-mono text-text-secondary uppercase tracking-wider">Travel OS</p>
            </div>
          </div>
          <h3 className="text-3xl font-display font-bold text-text-primary mb-4">
            Start your journey
          </h3>
          <p className="text-text-secondary leading-relaxed mb-8">
            Create an account to unlock AI-powered trip planning, interactive maps, and seamless itinerary management.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <FaRocket className="h-4 w-4 text-accent" />
              AI-powered trip planning
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <FaShieldAlt className="h-4 w-4 text-success" />
              Secure & private
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <h2 className="text-xl font-display font-bold text-text-primary">Create account</h2>
          </div>

          <Card elevated className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                type="text"
                label="Full Name"
                placeholder="Your name"
                icon={FaUser}
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                required
              />

              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                icon={FaEnvelope}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                required
              />

              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Min 8 chars: uppercase, lowercase, number, symbol"
                icon={FaLock}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
              />

              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Confirm password"
                icon={FaLock}
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                disabled={!isValid || isLoading}
                loading={isLoading}
              >
                {isLoading ? "Creating..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-text-secondary">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-accent hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <FaShieldAlt className="h-3.5 w-3.5 text-success" />
              Secure
            </span>
            <span className="flex items-center gap-1.5">
              <FaRocket className="h-3.5 w-3.5 text-accent" />
              Free to start
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
