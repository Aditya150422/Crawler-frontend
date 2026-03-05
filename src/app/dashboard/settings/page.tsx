"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Palette,
  Save,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
  ChevronRight,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { useAuthStore } from "@/store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type SettingsTab = "profile" | "security" | "notifications" | "appearance";

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

const tabs: TabConfig[] = [
  { id: "profile", label: "Profile", icon: User, description: "Manage your account details" },
  { id: "security", label: "Security", icon: Shield, description: "Password and authentication" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Email and push preferences" },
  { id: "appearance", label: "Appearance", icon: Palette, description: "Theme and display settings" },
];

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showMobileTabs, setShowMobileTabs] = useState(false);

  // Profile form state
  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  // Security form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [scrapeComplete, setScrapeComplete] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);

  // Appearance state
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const activeTabConfig = tabs.find((t) => t.id === activeTab)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Tab Selector */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMobileTabs(!showMobileTabs)}
            className="w-full flex items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-dark-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
                <activeTabConfig.icon className="w-5 h-5 text-primary-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-white">{activeTabConfig.label}</div>
                <div className="text-xs text-gray-400">{activeTabConfig.description}</div>
              </div>
            </div>
            <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform", showMobileTabs && "rotate-90")} />
          </button>

          {showMobileTabs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 bg-dark-800/50 rounded-xl border border-dark-700/50 overflow-hidden"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMobileTabs(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 transition-colors",
                      activeTab === tab.id
                        ? "bg-white/5 text-white"
                        : "text-gray-400 hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <Check className="w-4 h-4 ml-auto text-primary-400" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                      activeTab === tab.id
                        ? "bg-white/5 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="text-sm font-medium">{tab.label}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-4 pt-4 border-t border-dark-700/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Update your account details and email address
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                    {name.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">{name || "User"}</h3>
                    <p className="text-sm text-gray-400">{email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-dark-700/50 border border-dark-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-dark-700/50 border border-dark-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-dark-700/50">
                  <Button
                    variant="primary"
                    onClick={handleSaveProfile}
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white">Change Password</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Ensure your account is using a strong password
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 bg-dark-700/50 border border-dark-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 bg-dark-700/50 border border-dark-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                        placeholder="Enter new password"
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-dark-700/50 border border-dark-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                        placeholder="Confirm new password"
                      />
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Passwords don't match
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-dark-700/50">
                  <Button
                    variant="primary"
                    onClick={handleChangePassword}
                    isLoading={isSaving}
                    disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                    leftIcon={<Shield className="w-4 h-4" />}
                  >
                    Update Password
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Choose how you want to be notified
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: "email", label: "Email Notifications", desc: "Receive notifications via email", state: emailNotifications, setter: setEmailNotifications },
                    { id: "scrape", label: "Scrape Complete", desc: "Notify when scraping jobs finish", state: scrapeComplete, setter: setScrapeComplete },
                    { id: "weekly", label: "Weekly Digest", desc: "Summary of your activity every week", state: weeklyDigest, setter: setWeeklyDigest },
                    { id: "updates", label: "Product Updates", desc: "News about new features and updates", state: productUpdates, setter: setProductUpdates },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-dark-700/30 rounded-xl"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-white">{item.label}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.setter(!item.state)}
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors relative",
                          item.state ? "bg-primary-500" : "bg-dark-600"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform",
                            item.state ? "left-6" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-dark-700/50">
                  <Button
                    variant="primary"
                    onClick={handleSaveNotifications}
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Preferences
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white">Appearance</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Customize how the app looks
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Theme
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
                      { id: "light", label: "Light", icon: Sun, desc: "Classic bright theme" },
                      { id: "system", label: "System", icon: SettingsIcon, desc: "Match your device" },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setTheme(option.id as typeof theme)}
                          className={cn(
                            "flex flex-col items-center p-4 rounded-xl border-2 transition-colors",
                            theme === option.id
                              ? "border-primary-500 bg-primary-500/10"
                              : "border-dark-600 bg-dark-700/30 hover:border-dark-500"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                            theme === option.id ? "bg-primary-500/20" : "bg-dark-600/50"
                          )}>
                            <Icon className={cn("w-6 h-6", theme === option.id ? "text-primary-400" : "text-gray-400")} />
                          </div>
                          <span className={cn("text-sm font-medium", theme === option.id ? "text-white" : "text-gray-300")}>
                            {option.label}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">{option.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-400">Coming Soon</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Light theme and system preference are currently in development
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>

          {/* Logout for Mobile */}
          <div className="lg:hidden mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
