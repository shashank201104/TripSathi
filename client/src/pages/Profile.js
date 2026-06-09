import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { userAPI } from "../services/api";
import { Card, Button, Input, PageHeader } from "../components/ui";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaSave,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile Details State
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullName =
        `${profileData.firstName} ${profileData.lastName}`.trim();

      const response = await userAPI.updateProfile({
        name: fullName,
        email: profileData.email,
      });

      if (response.data.success) {
        updateUser({ ...user, name: fullName, email: profileData.email });
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-bg">
      <div className="page-container relative max-w-4xl">
        <PageHeader
          title="My Profile"
          subtitle="Manage your account settings and preferences"
        />

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-2.5 px-4 text-sm rounded-md font-medium transition-all ${
              activeTab === "details"
                ? "bg-accent text-bg"
                : "bg-surface-elevated text-text-secondary border border-border hover:border-accent/30"
            }`}
          >
            <FaUser className="inline-block mr-2" />
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-2.5 px-4 text-sm rounded-md font-medium transition-all ${
              activeTab === "security"
                ? "bg-accent text-bg"
                : "bg-surface-elevated text-text-secondary border border-border hover:border-accent/30"
            }`}
          >
            <FaShieldAlt className="inline-block mr-2" />
            Security
          </button>
        </div>

        {/* Profile Details Tab */}
        {activeTab === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card elevated className="p-6 md:p-8">
              <h2 className="text-xl font-display font-semibold text-text-primary mb-6 flex items-center">
                <FaUser className="mr-3 text-accent" />
                Profile Information
              </h2>

              <form onSubmit={handleProfileSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Input
                    name="firstName"
                    label="First Name"
                    placeholder="Enter your first name"
                    icon={FaUser}
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    required
                  />

                  <Input
                    name="lastName"
                    label="Last Name"
                    placeholder="Enter your last name"
                    icon={FaUser}
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  icon={FaEnvelope}
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                  <p className="hidden md:block text-sm text-text-secondary font-mono">
                    Trusted Traveler
                  </p>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    className="w-full md:w-auto"
                  >
                    <FaSave className="mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card elevated className="p-6 md:p-8">
              <h2 className="text-xl font-display font-semibold text-text-primary mb-6 flex items-center">
                <FaLock className="mr-3 text-accent" />
                Change Password
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 md:space-y-6">
                <Input
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  label="Current Password"
                  placeholder="Enter your current password"
                  icon={FaLock}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                />

                <Input
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  label="New Password"
                  placeholder="Enter your new password"
                  icon={FaLock}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                />

                <Input
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  icon={FaLock}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    className="w-full md:w-auto"
                  >
                    <FaShieldAlt className="mr-2" />
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-accent-muted border border-accent/20 rounded-lg">
                  <h4 className="text-sm font-medium text-text-primary mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-xs text-text-secondary space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Must include Uppercase, Lowercase, and Number</li>
                    <li>• Must include a Special Character (@$!%*?&)</li>
                  </ul>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
