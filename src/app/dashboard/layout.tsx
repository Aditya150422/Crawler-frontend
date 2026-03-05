"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  Map,
  Bell,
  Search,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { Button, Badge } from "@/components/ui";

const navItems = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard,
    description: "Overview & stats"
  },
  { 
    href: "/dashboard/collections", 
    label: "Collections", 
    icon: FolderOpen,
    description: "Manage websites"
  },
  { 
    href: "/dashboard/chat", 
    label: "AI Chat", 
    icon: MessageSquare,
    description: "Chat with your data"
  },
  { 
    href: "/dashboard/learning-path", 
    label: "Learning Path", 
    icon: Map,
    description: "Generate curricula"
  },
  { 
    href: "/dashboard/settings", 
    label: "Settings", 
    icon: Settings,
    description: "Preferences"
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, fetchUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      fetchUser();
    }
  }, [fetchUser, user]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getPageTitle = () => {
    const item = navItems.find(item => 
      pathname === item.href || 
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
    );
    return item?.label || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-[60] flex items-start justify-center pt-[20vh]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-xl mx-4 bg-dark-800 rounded-2xl border border-dark-600/50 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4 border-b border-dark-600/50">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search collections, chats, or settings..."
                  className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
                  autoFocus
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-dark-700 rounded text-xs text-gray-400">
                  ESC
                </kbd>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 text-center py-8">
                  Start typing to search...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-dark-900 border-r border-dark-700/50",
          "transform transition-all duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "lg:w-20" : "w-72 lg:w-64 xl:w-72"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700/50">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-bold text-white hidden sm:block"
                >
                  WebScrapper
                </motion.span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-primary-500/20 to-accent-cyan/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary-500 to-accent-cyan rounded-r-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                    isActive 
                      ? "bg-primary-500/20" 
                      : "bg-dark-700/50 group-hover:bg-dark-700"
                  )}>
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary-400" : "text-gray-400 group-hover:text-white"
                    )} />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{item.label}</span>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    </div>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <ChevronRight className="w-4 h-4 text-primary-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse button - desktop only */}
          <div className="hidden lg:block p-3 border-t border-dark-700/50">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                sidebarCollapsed ? "" : "rotate-180"
              )} />
              {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
            </button>
          </div>

          {/* User Section */}
          <div className="p-3 border-t border-dark-700/50">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors",
                  sidebarCollapsed && "justify-center"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center ring-2 ring-dark-700 shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                {!sidebarCollapsed && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {user?.username || "User"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email || "Not logged in"}
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        userMenuOpen && "rotate-180"
                      )}
                    />
                  </>
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      "absolute bottom-full mb-2 bg-dark-800 border border-dark-600 rounded-xl overflow-hidden shadow-xl",
                      sidebarCollapsed ? "left-full ml-2 w-48" : "left-0 right-0"
                    )}
                  >
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "min-h-screen transition-all duration-300",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64 xl:pl-72"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Mobile logo */}
              <Link href="/" className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-800 border border-dark-600/50 text-gray-400 hover:text-white hover:border-dark-500 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:block text-sm">Search</span>
                <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 bg-dark-700 rounded text-xs">
                  <Command className="w-3 h-3" />K
                </kbd>
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
              </button>

              {/* Mobile user avatar */}
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center ring-2 ring-dark-700"
              >
                <span className="text-sm font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
