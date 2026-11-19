
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock,
  CheckCircle,
  ChevronRight,
  X,
  Play,
  ExternalLink,
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
  youtubeUrl?: string;
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

/**
 * Extracts a valid YouTube video ID from supported URL formats.
 */
function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  try {
    const normalizedUrl = url.trim().startsWith("http")
      ? url.trim()
      : `https://${url.trim()}`;

    const parsedUrl = new URL(normalizedUrl);

    const hostname = parsedUrl.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = parsedUrl.pathname
        .split("/")
        .filter(Boolean)[0] || null;
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      const parts = parsedUrl.pathname
        .split("/")
        .filter(Boolean);

      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v");
      } else if (
        ["embed", "shorts", "live", "v"].includes(parts[0])
      ) {
        videoId = parts[1] || null;
      }
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      console.error("Invalid YouTube video URL:", url);
      return null;
    }

    return videoId;
  } catch (error) {
    console.error("YouTube URL parsing error:", error);
    return null;
  }
}

/**
 * Creates a YouTube embed URL.
 */
function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    playsinline: "1",
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Generates the YouTube thumbnail URL.
 */
function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) return null;

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function WatchTimer({
  durationMinutes,
  language,
  onComplete,
}: {
  durationMinutes: number;
  language: string;
  onComplete: () => void;
}) {
  const [seconds, setSeconds] = useState(0);

  const required = Math.max(
    1,
    Math.floor(durationMinutes * 60 * 0.8)
  );

  const ready = seconds >= required;

  const percent = Math.min(
    100,
    Math.floor((seconds / required) * 100)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

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

          <span>
            {percent}
            {t(language, "watched")}
          </span>
        </div>
      ) : (
        <button
          onClick={onComplete}
          className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
        >
          {t(language, "markComplete")}
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function LessonsPage() {
  const { language } = useAppStore();

  const isNonEnglish = language !== "English";

  const qc = useQueryClient();

  const [activeCategory, setActiveCategory] = useState<
    number | undefined
  >();

  const [selectedLesson, setSelectedLesson] =
    useState<Lesson | null>(null);

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () =>
      apiClient
        .get("/lessons/categories")
        .then((response) => response.data),
  });

  const categories = categoriesQuery.data ?? [];

  const {
    data: lessons = [],
    isLoading,
    isError,
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

  const completeMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient.post(`/lessons/${id}/complete`),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["lessons"],
      });

      toast.success(
        t(language, "completed") + "! 🎉"
      );

      setSelectedLesson(null);
    },

    onError: () => {
      toast.error("Unable to mark lesson as completed.");
    },
  });

  const embedUrl = selectedLesson?.youtubeUrl
    ? getYouTubeEmbedUrl(selectedLesson.youtubeUrl)
    : null;

  const videoId = selectedLesson?.youtubeUrl
    ? getYouTubeVideoId(selectedLesson.youtubeUrl)
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}

      <div>
        <h1 className="text-2xl font-bold">
          {t(language, "learn")}
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          {t(language, "learnDesc")}
        </p>
      </div>

      {/* Categories */}

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
            onClick={() =>
              setActiveCategory(category.id)
            }
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

      {/* Lessons */}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-40 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-red-500">
          Unable to load lessons. Please try again.
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t(language, "noLessons")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson, index) => {
            const thumbnail = lesson.youtubeUrl
              ? getYouTubeThumbnail(lesson.youtubeUrl)
              : null;

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
                    lesson.completed &&
                      "ring-1 ring-green-300"
                  )}
                  onClick={() =>
                    setSelectedLesson(lesson)
                  }
                >
                  {thumbnail && (
                    <div className="relative w-full h-36 bg-black overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={lesson.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
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
                          LEVEL_COLOR[lesson.level]
                        )}
                      >
                        {getLevelLabel(
                          language,
                          lesson.level
                        )}
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
                      {isNonEnglish &&
                      lesson.descriptionHindi
                        ? lesson.descriptionHindi
                        : lesson.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {lesson.durationMinutes} min
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Video Player Modal */}

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
              initial={{
                scale: 0.95,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* YouTube Player */}

              {embedUrl && videoId ? (
                <div
                  className="relative w-full bg-black"
                  style={{ paddingTop: "56.25%" }}
                >
                  <iframe
                    key={videoId}
                    src={embedUrl}
                    title={selectedLesson.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : selectedLesson.youtubeUrl ? (
                <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-600 text-sm gap-2 p-4">
                  <p>Invalid YouTube video URL.</p>
                  <p className="text-xs text-gray-400">
                    Please check the video URL.
                  </p>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                  <Play className="w-8 h-8 opacity-30" />
                  No video available
                </div>
              )}

              {/* Lesson Details */}

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      {isNonEnglish &&
                      selectedLesson.titleHindi
                        ? selectedLesson.titleHindi
                        : selectedLesson.title}
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1">
                      {isNonEnglish &&
                      selectedLesson.descriptionHindi
                        ? selectedLesson.descriptionHindi
                        : selectedLesson.description}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedLesson(null)
                    }
                    aria-label="Close video"
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Video Information */}

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      LEVEL_COLOR[selectedLesson.level]
                    )}
                  >
                    {getLevelLabel(
                      language,
                      selectedLesson.level
                    )}
                  </Badge>

                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {selectedLesson.durationMinutes} min
                  </span>

                  {selectedLesson.completed ? (
                    <span className="ml-auto flex items-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {t(language, "completed")}
                    </span>
                  ) : (
                    <WatchTimer
                      key={selectedLesson.id}
                      durationMinutes={
                        selectedLesson.durationMinutes
                      }
                      language={language}
                      onComplete={() =>
                        completeMutation.mutate(
                          selectedLesson.id
                        )
                      }
                    />
                  )}
                </div>

                {/* Open on YouTube */}

                {videoId && (
                  <div className="mt-4">
                    <a
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open video on YouTube
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
