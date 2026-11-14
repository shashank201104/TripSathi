import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import { Button, Input, Card } from "../../components/ui";
import { FaRoute, FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { values, errors, handleChange, handleBlur, isValid } =
    useFormValidation(
      { email: "", password: "", rememberMe: false },
      {
        email: { required: true, email: true, trim: true, maxLength: 254 },
        password: { required: true, minLength: 8, maxLength: 128 },
      }
    );

  const requestedPath = location.state?.from?.pathname;
  const from =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? `${requestedPath}${location.state.from.search || ""}`
      : "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const result = await login(values.email.trim().toLowerCase(), values.password);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      <div className="auth-visual hidden lg:flex lg:w-1/2 relative items-end p-12">
        <div className="relative max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent-muted border border-accent/20 flex items-center justify-center">
              <FaRoute className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white">TripSathi</h2>
            </div>
          </div>
          <h3 className="text-3xl font-display font-bold text-white mb-4">
            The journey begins before you leave.
          </h3>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-6">
            <span className="font-display text-xl font-bold text-accent">TripSathi</span>
          </div>

          <Card elevated className="auth-form-card p-6 md:p-8">
            <p className="section-label mb-3">Welcome back</p>
            <h1 className="mb-7 text-3xl font-bold">Good to see you.</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                autoComplete="username"
                maxLength={254}
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
                placeholder="Enter password"
                autoComplete="current-password"
                maxLength={128}
                minLength={8}
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
              />

              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={values.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-accent focus:ring-accent border-border rounded bg-surface-elevated"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-text-secondary">
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!isValid || isLoading}
                loading={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <p className="text-center text-sm text-text-secondary">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  state={{ from: location.state?.from }}
                  className="font-semibold text-accent hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
