"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, CheckCircle, ChevronRight, X, Play } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/app.store";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  slug: string;
  name: string;
  nameHindi?: string;
  icon: string;
  color: string;
}

interface Lesson {
  id: number;
  categoryId: number;
  title: string;
  titleHindi?: string;
  description: string;
  level: string;
  durationMinutes: number;
  completed: boolean;
  bookmarked: boolean;
  youtubeUrl?: string;
}

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
    }
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(url: string): string | null {
  try {
    const embedUrl = getYouTubeEmbedUrl(url);
    if (!embedUrl) return null;
    const videoId = embedUrl.split("/embed/")[1]?.split("?")[0];
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch {
    return null;
  }
}

export default function LessonsPage() {
  const { language } = useAppStore();
  const isHindi = language === "Hindi";
  const qc = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<number | undefined>();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiClient.get("/lessons/categories").then((r) => r.data),
  });

  const { data: lessons = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ["lessons", activeCategory],
    queryFn: () =>
      apiClient
        .get("/lessons", { params: { category_id: activeCategory, limit: 50 } })
        .then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/lessons/${id}/complete`),
    onSuccess: () => {
