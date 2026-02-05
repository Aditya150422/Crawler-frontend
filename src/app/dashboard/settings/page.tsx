"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Bell, Palette, Save, Loader2 } from "lucide-react";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";
import { useAuthStore } from "@/store";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.updateMe({
        username: formData.username,
        email: formData.email,
      });
      await fetchUser();
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error((error as Error).message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const settingsSections = [
    {
      title: "Profile Information",
      description: "Update your account details",
      icon: User,
      content: (
        <div className="space-y-4">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            leftIcon={<User className="w-5 h-5" />}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail className="w-5 h-5" />}
          />
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      ),
    },
    {
      title: "Security",
      description: "Manage your account security settings",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-dark-700/30 rounded-xl">
            <div>
              <h4 className="font-medium text-white">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <Badge variant="warning">Coming Soon</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-dark-700/30 rounded-xl">
            <div>
              <h4 className="font-medium text-white">Active Sessions</h4>
              <p className="text-sm text-gray-400">
                Manage devices where you&apos;re signed in
              </p>
            </div>
            <Badge variant="success">1 Active</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-dark-700/30 rounded-xl">
            <div>
              <h4 className="font-medium text-white">Change Password</h4>
              <p className="text-sm text-gray-400">
                Update your password regularly for security
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Change
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Notifications",
      description: "Configure how you receive notifications",
      icon: Bell,
      content: (
        <div className="space-y-4">
          {[
            { label: "Email notifications", description: "Receive updates via email", enabled: true },
            { label: "Job completion alerts", description: "Get notified when scraping is done", enabled: true },
            { label: "Weekly digest", description: "Summary of your activity", enabled: false },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-dark-700/30 rounded-xl"
            >
              <div>
                <h4 className="font-medium text-white">{item.label}</h4>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-600 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Appearance",
      description: "Customize the look and feel",
      icon: Palette,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-dark-700/30 rounded-xl">
            <div>
              <h4 className="font-medium text-white">Theme</h4>
              <p className="text-sm text-gray-400">Choose your preferred theme</p>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg bg-dark-900 border-2 border-primary-500 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-dark-700" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white border-2 border-transparent opacity-50 cursor-not-allowed" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-dark-700/30 rounded-xl">
            <div>
              <h4 className="font-medium text-white">Accent Color</h4>
              <p className="text-sm text-gray-400">Choose your accent color</p>
            </div>
            <div className="flex gap-2">
              {["bg-primary-500", "bg-accent-purple", "bg-accent-emerald", "bg-accent-pink"].map(
                (color, i) => (
                  <button
                    key={i}
                    className={`w-8 h-8 rounded-lg ${color} ${i === 0 ? "ring-2 ring-white/30" : ""}`}
                  />
                )
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account preferences</p>
      </div>

      {/* Account Status */}
      <Card className="gradient-border">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">{user?.username || "User"}</h2>
              <p className="text-gray-400">{user?.email || "Loading..."}</p>
            </div>
            <div className="text-right">
              <Badge variant="success" size="md">Active</Badge>
              <p className="text-xs text-gray-500 mt-1">
                Member since {user?.created_at ? new Date(user.created_at).getFullYear() : "..."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      {settingsSections.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <div className="px-6 py-4 border-b border-dark-600/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{section.title}</h3>
                <p className="text-sm text-gray-400">{section.description}</p>
              </div>
            </div>
            <CardContent>{section.content}</CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <div className="px-6 py-4 border-b border-red-500/20">
          <h3 className="font-semibold text-red-400">Danger Zone</h3>
          <p className="text-sm text-gray-400">Irreversible actions</p>
        </div>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/20">
            <div>
              <h4 className="font-medium text-white">Delete Account</h4>
              <p className="text-sm text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="danger">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
