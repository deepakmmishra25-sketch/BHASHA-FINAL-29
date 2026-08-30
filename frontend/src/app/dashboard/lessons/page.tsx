"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, CheckCircle, ChevronRight, X, Play } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/app.store";
import { t } from "@/lib/translations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

function WatchTimer({
  durationMinutes,
  onComplete,
}: {
  durationMinutes: number;
  onComplete: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const required = Math.floor(durationMinutes * 60 * 0.8);
  const ready = seconds >= required;
  const percent = Math.min(100, Math.floor((seconds / required) * 100));

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ml-auto flex items-center gap-2">
      {!ready ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span>{percent}% watched</span>
        </div>
      ) : (
        <button
          onClick={onComplete}
          className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
        >
          Mark as Complete <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
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
      qc.invalidateQueries({ queryKey: ["lessons"] });
      toast.success("Lesson completed! 🎉");
      setSelectedLesson(null);
    },
  });

  const embedUrl = selectedLesson?.youtubeUrl
    ? getYouTubeEmbedUrl(selectedLesson.youtubeUrl)
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">{isHindi ? "सीखें" : "Learn"}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isHindi
            ? "अपनी गति से, अपनी भाषा में सीखें"
            : "Learn at your own pace, in your language"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(undefined)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
            !activeCategory
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeCategory === c.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {isHindi && c.nameHindi ? c.nameHindi : c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{isHindi ? "कोई पाठ नहीं मिला" : "No lessons found"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((l, i) => {
            const thumbnail = l.youtubeUrl
              ? getYouTubeThumbnail(l.youtubeUrl)
              : null;
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className={cn(
                    "border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden",
                    l.completed && "ring-1 ring-green-300"
                  )}
                  onClick={() => setSelectedLesson(l)}
                >
                  {thumbnail && (
                    <div className="relative w-full h-36 bg-black overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={l.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 rounded-full p-2.5 shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          LEVEL_COLOR[l.level]
                        )}
                      >
                        {l.level}
                      </Badge>
                      {l.completed && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {isHindi && l.titleHindi ? l.titleHindi : l.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {l.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {l.durationMinutes} min
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelectedLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {embedUrl ? (
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-muted-foreground text-sm">
                  No video available for this lesson
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      {isHindi && selectedLesson.titleHindi
                        ? selectedLesson.titleHindi
                        : selectedLesson.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedLesson.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      LEVEL_COLOR[selectedLesson.level]
                    )}
                  >
                    {selectedLesson.level}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {selectedLesson.durationMinutes} min
                  </span>
                  {selectedLesson.completed ? (
                    <span className="ml-auto flex items-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" /> Completed
                    </span>
                  ) : (
                    <WatchTimer
                      durationMinutes={selectedLesson.durationMinutes}
                      onComplete={() => completeMutation.mutate(selectedLesson.id)}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
