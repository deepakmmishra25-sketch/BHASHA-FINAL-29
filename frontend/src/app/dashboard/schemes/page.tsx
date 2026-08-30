"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, Landmark, Filter, Sparkles, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app.store";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

interface Scheme {
  id: number; name: string; nameHindi?: string; category: string;
  ministry: string; description: string; eligibility: string;
  benefits: string; websiteUrl?: string; targetAudience: string; reason?: string;
}

const CATEGORIES = ["All", "finance", "farming", "business", "education", "digital", "health"];

const UI: Record<string, Record<string, string>> = {
  English:   { title: "Government Schemes", subtitle: "Find the right government scheme for you", aiTitle: "Find your scheme with AI", aiPlaceholder: "e.g. I'm a farmer with 1 acre and want to grow vegetables", askAI: "Ask AI", aiRec: "AI Recommendations", clear: "Clear", browseAll: "Browse all schemes", search: "Search schemes...", searchBtn: "Search", allCats: "All Categories", noSchemes: "No schemes found", eligibility: "Eligibility", benefits: "Benefits", applyNow: "Apply Now" },
  Hindi:     { title: "सरकारी योजनाएं", subtitle: "आपके लिए सही सरकारी योजना खोजें", aiTitle: "AI से सही योजना खोजें", aiPlaceholder: "जैसे: मैं एक महिला हूं और छोटा व्यापार शुरू करना चाहती हूं", askAI: "खोजें", aiRec: "AI की सिफारिश", clear: "साफ करें", browseAll: "सभी योजनाएं देखें", search: "योजना खोजें...", searchBtn: "खोजें", allCats: "सभी", noSchemes: "कोई योजना नहीं मिली", eligibility: "पात्रता", benefits: "लाभ", applyNow: "अभी आवेदन करें" },
  Marathi:   { title: "सरकारी योजना", subtitle: "तुमच्यासाठी योग्य सरकारी योजना शोधा", aiTitle: "AI ने योजना शोधा", aiPlaceholder: "उदा. मी शेतकरी आहे आणि भाजीपाला लागवड करायची आहे", askAI: "शोधा", aiRec: "AI शिफारस", clear: "साफ करा", browseAll: "सर्व योजना पहा", search: "योजना शोधा...", searchBtn: "शोधा", allCats: "सर्व", noSchemes: "कोणती योजना मिळाली नाही", eligibility: "पात्रता", benefits: "फायदे", applyNow: "आता अर्ज करा" },
  Gujarati:  { title: "સરકારી યોજનાઓ", subtitle: "તમારા માટે યોગ્ય સરકારી યોજના શોધો", aiTitle: "AI સાથે યોજना શોધો", aiPlaceholder: "દા.ત. હું ખેડૂત છું અને શાકભાજી ઉગાડવા ચાહું છું", askAI: "શોધો", aiRec: "AI ભલામણ", clear: "સાફ કરો", browseAll: "બધી યોજनाઓ જુઓ", search: "યોજना શોધો...", searchBtn: "શોધો", allCats: "બધું", noSchemes: "કોઈ યોજна મળી નથી", eligibility: "પાત્રता", benefits: "ફायदા", applyNow: "હવે અpply કરો" },
  Tamil:     { title: "அரசு திட்டங்கள்", subtitle: "உங்களுக்கான சரியான அரசு திட்டத்தை கண்டறியுங்கள்", aiTitle: "AI மூலம் திட்டம் கண்டறியுங்கள்", aiPlaceholder: "எ.கா. நான் 1 ஏக்கர் உள்ள விவசாயி, காய்கறி பயிரிட விரும்புகிறேன்", askAI: "கேளுங்கள்", aiRec: "AI பரிந்துரைகள்", clear: "அழிக்க", browseAll: "அனைத்து திட்டங்களையும் காணுங்கள்", search: "திட்டங்கள் தேடுங்கள்...", searchBtn: "தேடு", allCats: "அனைத்தும்", noSchemes: "திட்டங்கள் எதுவும் இல்லை", eligibility: "தகுதி", benefits: "நன்மைகள்", applyNow: "இப்போது விண்ணப்பிக்கவும்" },
  Telugu:    { title: "ప్రభుత్వ పథకాలు", subtitle: "మీకు సరైన ప్రభుత్వ పథకాన్ని కనుగొనండి", aiTitle: "AI తో పథకం కనుగొనండి", aiPlaceholder: "ఉదా. నేను 1 ఎకరం కలిగిన రైతుని, కూరగాయలు పండించాలనుకుంటున్నాను", askAI: "అడగండి", aiRec: "AI సిఫార్సులు", clear: "తొలగించు", browseAll: "అన్ని పథకాలు చూడండి", search: "పథకాలు వెతకండి...", searchBtn: "వెతకండి", allCats: "అన్నీ", noSchemes: "పథకాలు కనుగొనబడలేదు", eligibility: "అర్హత", benefits: "ప్రయోజనాలు", applyNow: "ఇప్పుడు దరఖాస్తు చేయండి" },
  Kannada:   { title: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", subtitle: "ನಿಮಗೆ ಸರಿಯಾದ ಸರ್ಕಾರಿ ಯೋಜನೆಯನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ", aiTitle: "AI ನೊಂದಿಗೆ ಯೋಜನೆ ಕಂಡುಹಿಡಿಯಿರಿ", aiPlaceholder: "ಉದಾ. ನಾನು 1 ಎಕರೆ ಹೊಂದಿರುವ ರೈತ, ತರಕಾರಿ ಬೆಳೆಯಲು ಬಯಸುತ್ತೇನೆ", askAI: "ಕೇಳಿ", aiRec: "AI ಶಿಫಾರಸುಗಳು", clear: "ತೆರವುಗೊಳಿಸಿ", browseAll: "ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ", search: "ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ...", searchBtn: "ಹುಡುಕಿ", allCats: "ಎಲ್ಲಾ", noSchemes: "ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ", eligibility: "ಅರ್ಹತೆ", benefits: "ಪ್ರಯೋಜನಗಳು", applyNow: "ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" },
  Malayalam: { title: "സർക്കാർ പദ്ധതികൾ", subtitle: "നിങ്ങൾക്ക് അനുയോജ്യമായ സർക്കാർ പദ്ധതി കണ്ടെത്തൂ", aiTitle: "AI ഉപയോഗിച്ച് പദ്ധതി കണ്ടെത്തൂ", aiPlaceholder: "ഉദാ. ഞാൻ 1 ഏക്കർ ഉള്ള കർഷകൻ, പച്ചക്കറി കൃഷി ചെയ്യണം", askAI: "ചോദിക്കൂ", aiRec: "AI ശുപാർശകൾ", clear: "മായ്ക്കൂ", browseAll: "എല്ലാ പദ്ധതികളും കാണൂ", search: "പദ്ധതികൾ തിരയൂ...", searchBtn: "തിരയൂ", allCats: "എല്ലാം", noSchemes: "പദ്ധതികൾ കണ്ടെത്തിയില്ല", eligibility: "യോഗ്യത", benefits: "ആനുകൂല്യങ്ങൾ", applyNow: "ഇപ്പോൾ അപേക്ഷിക്കൂ" },
  Punjabi:   { title: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ", subtitle: "ਤੁਹਾਡੇ ਲਈ ਸਹੀ ਸਰਕਾਰੀ ਯੋਜਨਾ ਲੱਭੋ", aiTitle: "AI ਨਾਲ ਯੋਜਨਾ ਲੱਭੋ", aiPlaceholder: "ਜਿਵੇਂ: ਮੈਂ 1 ਏਕੜ ਵਾਲਾ ਕਿਸਾਨ ਹਾਂ, ਸਬਜ਼ੀਆਂ ਉਗਾਉਣਾ ਚਾਹੁੰਦਾ ਹਾਂ", askAI: "ਪੁੱਛੋ", aiRec: "AI ਸਿਫਾਰਸ਼ਾਂ", clear: "ਸਾਫ਼ ਕਰੋ", browseAll: "ਸਾਰੀਆਂ ਯੋਜਨਾਵਾਂ ਦੇਖੋ", search: "ਯੋਜਨਾਵਾਂ ਖੋਜੋ...", searchBtn: "ਖੋਜੋ", allCats: "ਸਾਰੀਆਂ", noSchemes: "ਕੋਈ ਯੋਜਨਾ ਨਹੀਂ ਮਿਲੀ", eligibility: "ਯੋਗਤਾ", benefits: "ਲਾਭ", applyNow: "ਹੁਣੇ ਅਰਜ਼ੀ ਦਿਓ" },
  Bengali:   { title: "সরকারি প্রকল্প", subtitle: "আপনার জন্য সঠিক সরকারি প্রকল্প খুঁজুন", aiTitle: "AI দিয়ে প্রকল্প খুঁজুন", aiPlaceholder: "যেমন: আমি 1 একর জমির কৃষক, সবজি চাষ করতে চাই", askAI: "জিজ্ঞেস করুন", aiRec: "AI সুপারিশ", clear: "মুছুন", browseAll: "সব প্রকল্প দেখুন", search: "প্রকল্প খুঁজুন...", searchBtn: "খুঁজুন", allCats: "সব", noSchemes: "কোনো প্রকল্প পাওয়া যায়নি", eligibility: "যোগ্যতা", benefits: "সুবিধা", applyNow: "এখনই আবেদন করুন" },
  Urdu:      { title: "سرکاری اسکیمیں", subtitle: "آپ کے لیے صحیح سرکاری اسکیم تلاش کریں", aiTitle: "AI سے اسکیم تلاش کریں", aiPlaceholder: "مثلاً: میں 1 ایکڑ کا کسان ہوں، سبزیاں اگانا چاہتا ہوں", askAI: "پوچھیں", aiRec: "AI سفارشات", clear: "صاف کریں", browseAll: "تمام اسکیمیں دیکھیں", search: "اسکیمیں تلاش کریں...", searchBtn: "تلاش", allCats: "سب", noSchemes: "کوئی اسکیم نہیں ملی", eligibility: "اہلیت", benefits: "فوائد", applyNow: "ابھی درخواست دیں" },
  Odia:      { title: "ସରକାରୀ ଯୋଜନା", subtitle: "ଆପଣଙ୍କ ପାଇଁ ସଠିକ ସରକାରୀ ଯୋଜନା ଖୋଜନ୍ତୁ", aiTitle: "AI ସହ ଯୋଜନା ଖୋଜନ୍ତୁ", aiPlaceholder: "ଯଥା: ମୁଁ 1 ଏକର ଜମି ଥିବା ଚାଷୀ, ପରିବା ଚାଷ କରିବାକୁ ଚାହୁଁ", askAI: "ପଚାରନ୍ତୁ", aiRec: "AI ସୁପାରିଶ", clear: "ସଫା କରନ୍ତୁ", browseAll: "ସମସ୍ତ ଯୋଜନା ଦେଖନ୍ତୁ", search: "ଯୋଜନା ଖୋଜନ୍ତୁ...", searchBtn: "ଖୋଜନ୍ତୁ", allCats: "ସମସ୍ତ", noSchemes: "କୌଣସି ଯୋଜନା ମିଳିଲା ନାହିଁ", eligibility: "ଯୋଗ୍ୟତା", benefits: "ଲାଭ", applyNow: "ବର୍ତ୍ତମାନ ଆବେଦନ କରନ୍ତୁ" },
  Assamese:  { title: "চৰকাৰী আঁচনি", subtitle: "আপোনাৰ বাবে সঠিক চৰকাৰী আঁচনি বিচাৰক", aiTitle: "AI ৰে আঁচনি বিচাৰক", aiPlaceholder: "যেনে: মই 1 বিঘা মাটিৰ কৃষক, পাচলি খেতি কৰিব বিচাৰো", askAI: "সুধক", aiRec: "AI পৰামৰ্শ", clear: "মচক", browseAll: "সকলো আঁচনি চাওক", search: "আঁচনি বিচাৰক...", searchBtn: "বিচাৰক", allCats: "সকলো", noSchemes: "কোনো আঁচনি পোৱা নগ'ল", eligibility: "যোগ্যতা", benefits: "সুবিধা", applyNow: "এতিয়াই আবেদন কৰক" },
};

function s(language: string, key: string): string {
  return UI[language]?.[key] ?? UI["English"][key] ?? key;
}

function SchemeCard({ sc, language, featured }: { sc: Scheme; language: string; featured?: boolean }) {
  const isEnglish = language === "English";
  return (
    <Card className={cn("border-0 shadow-sm hover:shadow-md transition-all", featured && "ring-2 ring-primary/30 bg-primary/5")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{!isEnglish && sc.nameHindi ? sc.nameHindi : sc.name}</CardTitle>
            {!isEnglish && sc.nameHindi && <p className="text-xs text-muted-foreground mt-0.5">{sc.name}</p>}
          </div>
          <Badge variant="outline" className="shrink-0 capitalize">{sc.category}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{sc.ministry}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {sc.reason && (
          <div className="flex items-start gap-2 bg-primary/10 rounded-lg px-3 py-2 text-xs text-primary">
            <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
            <p>{sc.reason}</p>
          </div>
        )}
        <p className="text-sm text-gray-700">{sc.description}</p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-semibold text-gray-500 mb-0.5">{s(language, "eligibility")}</p>
            <p className="text-gray-600">{sc.eligibility}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 mb-0.5">{s(language, "benefits")}</p>
            <p className="text-gray-600">{sc.benefits}</p>
          </div>
        </div>
        {sc.websiteUrl && (
          <a href={sc.websiteUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
            {s(language, "applyNow")} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export default function SchemesPage() {
  const { language } = useAppStore();
  const [q, setQ] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [aiResults, setAiResults] = useState<{ schemes: Scheme[]; aiSummary: string } | null>(null);

  const { data: schemes = [], isLoading } = useQuery<Scheme[]>({
    queryKey: ["schemes", search, category],
    queryFn: () =>
      apiClient.get("/schemes", {
        params: { q: search || undefined, category: category === "All" ? undefined : category, limit: 50 },
      }).then(r => r.data),
    staleTime: 30000,
  });

  const aiMutation = useMutation({
    mutationFn: (query: string) =>
      apiClient.post("/schemes/recommend", { query, language }).then(r => r.data),
    onSuccess: (data) => setAiResults(data),
  });

  const handleAiSearch = () => {
    const query = aiQuery.trim();
    if (!query) return;
    aiMutation.mutate(query);
  };

  const clearAi = () => { setAiResults(null); setAiQuery(""); };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Landmark className="w-6 h-6 text-primary" />
          {s(language, "title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{s(language, "subtitle")}</p>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-orange-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-primary">{s(language, "aiTitle")}</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAiSearch()}
              placeholder={s(language, "aiPlaceholder")}
              className="flex-1 bg-white"
            />
            <Button onClick={handleAiSearch} disabled={!aiQuery.trim() || aiMutation.isPending} className="gap-2">
              {aiMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {s(language, "askAI")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {aiResults && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {s(language, "aiRec")}
              </p>
              <Button variant="ghost" size="sm" onClick={clearAi} className="h-7 gap-1 text-xs">
                <X className="w-3 h-3" /> {s(language, "clear")}
              </Button>
            </div>
            {aiResults.aiSummary && (
              <div className="bg-primary/5 rounded-xl px-4 py-3 text-sm text-gray-700 border border-primary/10">
                {aiResults.aiSummary}
              </div>
            )}
            {aiResults.schemes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{s(language, "noSchemes")}</p>
            ) : (
              <div className="space-y-3">
                {aiResults.schemes.map(sc => <SchemeCard key={sc.id} sc={sc} language={language} featured />)}
              </div>
            )}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-3">{s(language, "browseAll")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={s(language, "search")}
            className="pl-9"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setSearch(q)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>
                {c === "All" ? s(language, "allCats") : c.charAt(0).toUpperCase() + c.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setSearch(q)}>{s(language, "searchBtn")}</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Landmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{s(language, "noSchemes")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.map((sc, i) => (
            <motion.div key={sc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <SchemeCard sc={sc} language={language} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
