import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import {
  NAME_PATTERN,
  NEW_PASSWORD_MAX_LENGTH,
  NEW_PASSWORD_MIN_LENGTH,
  validateNewPassword,
} from "../../utils/authValidation";
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
  const location = useLocation();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const requestedPath = location.state?.from?.pathname;
  const from =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? `${requestedPath}${location.state.from.search || ""}`
      : "/dashboard";

  const { values, errors, handleChange, handleBlur, isValid } =
    useFormValidation(
      { name: "", email: "", password: "", confirmPassword: "" },
      {
<<<<<<< HEAD
        name: {
          required: true,
          trim: true,
          minLength: 2,
          maxLength: 50,
          pattern: NAME_PATTERN,
          message: "Enter a valid name using letters, spaces, hyphens, or apostrophes.",
        },
        email: { required: true, email: true, trim: true, maxLength: 254 },
        password: {
          required: true,
          minLength: NEW_PASSWORD_MIN_LENGTH,
          maxLength: NEW_PASSWORD_MAX_LENGTH,
          validate: validateNewPassword,
=======
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
>>>>>>> parent of 67cf377 (minor bug fixed)
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
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        privacyPolicyAccepted: privacyAccepted,
      });
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Registration error:", error);
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
            <p className="section-label mb-3">Start your journey</p>
            <h1 className="mb-7 text-3xl font-bold">Create your account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                type="text"
                label="Full Name"
                placeholder="Your name"
                autoComplete="name"
                maxLength={50}
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
                autoComplete="email"
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
<<<<<<< HEAD
                placeholder="Create password"
                autoComplete="new-password"
                minLength={NEW_PASSWORD_MIN_LENGTH}
                maxLength={NEW_PASSWORD_MAX_LENGTH}
=======
                placeholder="Min 8 chars: uppercase, lowercase, number, symbol"
>>>>>>> parent of 67cf377 (minor bug fixed)
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
              <p className="-mt-2 text-xs text-text-secondary">
                Use at least {NEW_PASSWORD_MIN_LENGTH} characters. Spaces and
                passphrases are allowed; the maximum is {NEW_PASSWORD_MAX_LENGTH} UTF-8 bytes.
              </p>

              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Confirm password"
                autoComplete="new-password"
                minLength={NEW_PASSWORD_MIN_LENGTH}
                maxLength={NEW_PASSWORD_MAX_LENGTH}
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

              <div className="flex items-start gap-3">
                <input
                  id="privacy-policy-accepted"
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
                  required
                />
                <label htmlFor="privacy-policy-accepted" className="text-sm leading-6 text-text-secondary">
                  I have read and accept the{" "}
                  <Link to="/privacy/" className="font-semibold text-accent underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                disabled={!isValid || !privacyAccepted || isLoading}
                loading={isLoading}
              >
                {isLoading ? "Creating..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-text-secondary">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={{ from: location.state?.from }}
                  className="font-semibold text-accent hover:underline"
                >
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
