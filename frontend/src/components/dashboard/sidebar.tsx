"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageCircle, BookOpen, Landmark,
  FileText, Languages, Bell, Settings, Globe, LogOut,
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
    { href: "/dashboard/translate", label: t(language, "translate"), icon: Languages },
    { href: "/dashboard/ocr", label: t(language, "scanDocument"), icon: FileText },
    { href: "/dashboard/notifications", label: t(language, "notifications"), icon: Bell },
    { href: "/dashboard/settings", label: t(language, "settings"), icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col bg-gray-900
