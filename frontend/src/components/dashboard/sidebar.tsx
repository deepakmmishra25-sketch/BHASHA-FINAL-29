"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageCircle, BookOpen, Landmark,
  FileText, Bell, Settings, Globe, LogOut,
  ChevronLeft, ChevronRight, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/app.store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { t } from "@/lib/translations";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, language } = useAppStore();

  const NAV = [
    { href: "/dashboard", label: t(language, "dashboard"), icon: LayoutDashboard },
    { href: "/dashboard/chat", label: t(language, "aiMentor"), icon: MessageCircle },
    { href: "/dashboard/lessons", label: t(language, "learn"), icon: BookOpen },
    { href: "/dashboard/schemes", label: t(language, "govSchemes"), icon: Landmark },
    { href: "/dashboard/ocr", label: t(language, "scanDocument"), icon: FileText },
    { href: "/dashboard/notifications", label: t(language, "notifications"), icon: Bell },
    { href: "/dashboard/settings", label: t(language, "settings"), icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col bg-gray-900 h-full overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-500 to-orange-600 flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="ml-2 font-bold text-sm whitespace-nowrap"
            >
              BhashaSetu AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors group",
                active ? "bg-saffron-500/20 text-saffron-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0
