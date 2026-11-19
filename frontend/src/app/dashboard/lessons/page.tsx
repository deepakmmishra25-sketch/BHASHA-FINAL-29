
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Play,
} from "lucide-react";
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
  descriptionHindi?: string;
  level: string;
  durationMinutes: number;
  completed: boolean;
  bookmarked: boolean;
  youtubeUrl?: string | null;
}

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

const LEVEL_LABELS: Record<string, Record<string, string>> = {
  English: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  },
  Hindi: {
    beginner: "शुरुआती",
    intermediate: "मध्यम",
    advanced: "उन्नत",
  },
  Marathi: {
    beginner: "प्रारंभिक",
    intermediate: "मध्यम",
    advanced: "प्रगत",
  },
  Gujarati: {
    beginner: "શરૂઆત",
    intermediate: "મધ્યમ",
    advanced: "અદ્યતન",
  },
  Tamil: {
    beginner: "தொடக்கநிலை",
    intermediate: "இடைநிலை",
    advanced: "மேம்பட்ட",
  },
  Telugu: {
    beginner: "ప్రారంభ",
    intermediate: "మధ్యమ",
    advanced: "అధునాతన",
  },
  Kannada: {
    beginner: "ಆರಂಭಿಕ",
    intermediate: "ಮಧ್ಯಮ",
    advanced: "ಸುಧಾರಿತ",
  },
  Malayalam: {
    beginner: "തുടക്കക്കാർ",
    intermediate: "ഇടക്കാൽ",
    advanced: "വിദഗ്ദ്ധ",
  },
  Punjabi: {
    beginner: "ਸ਼ੁਰੂਆਤੀ",
    intermediate: "ਦਰਮਿਆਨੀ",
    advanced: "ਉੱਨਤ",
  },
  Bengali: {
    beginner: "প্রাথমিক",
    intermediate: "মধ্যবর্তী",
    advanced: "উন্নত",
  },
  Urdu: {
    beginner: "ابتدائی",
    intermediate: "درمیانی",
    advanced: "اعلی",
  },
  Odia: {
    beginner: "ଆରମ୍ଭିକ",
    intermediate: "ମଧ୍ୟବର୍ତ୍ତୀ",
    advanced: "ଉନ୍ନତ",
  },
  Assamese: {
    beginner: "আৰম্ভণিক",
    intermediate: "মধ্যবৰ্তী",
    advanced: "উন্নত",
  },
};

function getLevelLabel(language: string, level: string): string {
  return LEVEL_LABELS[language]?.[level] ?? level;
}

function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) return videoId;

      const parts = parsedUrl.pathname.split("/").filter(Boolean);

      if (
        ["shorts", "embed", "live"].includes(parts[0]) &&
        parts[1]
      ) {
        return parts[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(url?: string | null): string | null {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) return null;

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function openYouTubeVideo(url?: string | null) {
  if (!url) {
    toast.error("YouTube video link is not available");
    return;
  }

  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    toast.error("Invalid YouTube video link");
    return;
  }

  window.open(
    `https://www.youtube.com/watch?v=${videoId}`,
    "_blank",
    "noopener,noreferrer"
  );
}

export default function LessonsPage() {
  const { language } = useAppStore();
  const isNonEnglish = language !== "English";

  const [activeCategory, setActiveCategory] = useState<
    number | undefined
  >();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () =>
      apiClient
        .get("/lessons/categories")
        .then((response) => response.data),
  });

  const {
    data: lessons = [],
    isLoading,
  } = useQuery<Lesson[]>({
    queryKey: ["lessons", activeCategory],
    queryFn: () =>
      apiClient
        .get("/lessons", {
          params: {
            category_id: activeCategory,
            limit: 50,
          },
        })
        .then((response) => response.data),
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">
          {t(language, "learn")}
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          {t(language, "learnDesc")}
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
          {t(language, "all")}
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeCategory === category.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {isNonEnglish && category.nameHindi
              ? category.nameHindi
              : category.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-40 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t(language, "noLessons")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson, index) => {
            const thumbnail = getYouTubeThumbnail(
              lesson.youtubeUrl
            );

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card
                  className={cn(
                    "border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden",
                    lesson.completed && "ring-1 ring-green-300"
                  )}
                  onClick={() =>
                    openYouTubeVideo(lesson.youtubeUrl)
                  }
                >
                  <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={lesson.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-2.5 shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          LEVEL_COLOR[lesson.level]
                        )}
                      >
                        {getLevelLabel(language, lesson.level)}
                      </Badge>

                      {lesson.completed && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {isNonEnglish && lesson.titleHindi
                        ? lesson.titleHindi
                        : lesson.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {isNonEnglish && lesson.descriptionHindi
                        ? lesson.descriptionHindi
                        : lesson.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {lesson.durationMinutes} min
                      </div>

                      <span className="text-xs text-red-600 font-medium">
                        Watch on YouTube →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
