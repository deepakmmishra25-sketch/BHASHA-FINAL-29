"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app.store";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api";

interface Notif { id: number; title: string; message: string; type: string; isRead: boolean; createdAt: string; }

const TYPE_ICON: Record<string, { icon: typeof Info; color: string }> = {
  info:    { icon: Info,          color: "text-blue-500" },
  success: { icon: CheckCircle,   color: "text-green-500" },
  warning: { icon: AlertTriangle, color: "text-yellow-500" },
  error:   { icon: XCircle,       color: "text-red-500" },
};

const UI: Record<string, Record<string, string>> = {
  English:   { title: "Notifications", unread: "unread", markAll: "Mark all read", empty: "No notifications yet" },
  Hindi:     { title: "सूचनाएं", unread: "अपठित", markAll: "सभी पढ़े", empty: "अभी कोई सूचना नहीं" },
  Marathi:   { title: "सूचना", unread: "न वाचलेले", markAll: "सर्व वाचले", empty: "अद्याप कोणतीही सूचना नाही" },
  Gujarati:  { title: "સૂચनаઓ", unread: "ન વાંચ્યા", markAll: "બધા વાંચ્યા", empty: "હજી કોઈ સૂchna નથી" },
  Tamil:     { title: "அறிவிப்புகள்", unread: "படிக்காதவை", markAll: "அனைத்தையும் படித்தது", empty: "இன்னும் அறிவிப்புகள் இல்லை" },
  Telugu:    { title: "నోటిఫికేషన్లు", unread: "చదవనివి", markAll: "అన్నీ చదివాను", empty: "ఇంకా నోటిఫికేషన్లు లేవు" },
  Kannada:   { title: "ಅಧಿಸೂಚನೆಗಳು", unread: "ಓದಿಲ್ಲ", markAll: "ಎಲ್ಲಾ ಓದಿದ್ದೇನೆ", empty: "ಇನ್ನೂ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ" },
  Malayalam: { title: "അറിയിപ്പുകൾ", unread: "വായിക്കാത്തവ", markAll: "എല്ലാം വായിച്ചു", empty: "ഇനിയും അറിയിപ്പുകളില്ല" },
  Punjabi:   { title: "ਸੂਚਨਾਵਾਂ", unread: "ਨਹੀਂ ਪੜ੍ਹੀਆਂ", markAll: "ਸਾਰੀਆਂ ਪੜ੍ਹੀਆਂ", empty: "ਅਜੇ ਕੋਈ ਸੂਚਨਾ ਨਹੀਂ" },
  Bengali:   { title: "বিজ্ঞপ্তি", unread: "পড়া হয়নি", markAll: "সব পড়া হয়েছে", empty: "এখনো কোনো বিজ্ঞপ্তি নেই" },
  Urdu:      { title: "اطلاعات", unread: "نہیں پڑھی", markAll: "سب پڑھ لیا", empty: "ابھی کوئی اطلاع نہیں" },
  Odia:      { title: "ବିଜ୍ଞପ୍ତି", unread: "ପଢ଼ାଯାଇ ନାହିଁ", markAll: "ସବୁ ପଢ଼ା ହୋଇଛି", empty: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ବିଜ୍ଞପ୍ତି ନାହିଁ" },
  Assamese:  { title: "জাননী", unread: "পঢ়া হোৱা নাই", markAll: "সকলো পঢ়িলোঁ", empty: "এতিয়ালৈকে কোনো জাননী নাই" },
};

function n(language: string, key: string): string {
  return UI[language]?.[key] ?? UI["English"][key] ?? key;
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { language } = useAppStore();

  const { data: notifications = [] } = useQuery<Notif[]>({
    queryKey: ["notifications"],
    queryFn: () => apiClient.get("/notifications").then(r => r.data),
    refetchInterval: 30000,
  });

  const readMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const readAllMutation = useMutation({
    mutationFn: () => apiClient.post("/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> {n(language, "title")}
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unreadCount} {n(language, "unread")}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => readAllMutation.mutate()} className="gap-1.5">
            <CheckCheck className="w-3.5 h-3.5" /> {n(language, "markAll")}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{n(language, "empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const { icon: Icon, color } = TYPE_ICON[notif.type] ?? TYPE_ICON.info;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border transition-colors",
                  notif.isRead ? "bg-white border-gray-100" : "bg-blue-50/50 border-blue-100"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", color)} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", notif.isRead ? "text-gray-700" : "text-gray-900")}>{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(notif.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                {!notif.isRead && (
                  <button onClick={() => readMutation.mutate(notif.id)} className="p-1 hover:bg-gray-200 rounded transition-colors shrink-0">
                    <Check className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
