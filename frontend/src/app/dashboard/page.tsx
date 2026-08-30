"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MessageCircle, BookOpen, Landmark, FileText,
  ArrowRight, Sparkles, TrendingUp, Clock,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/app.store";
import apiClient from "@/lib/api";

// ── All UI strings for every supported language ──────────────────────────────
const UI: Record<string, Record<string, string>> = {
  English:   { hello:"Hello", tagline:"What would you like to learn or do today?", lessons:"Lessons Done", chats:"AI Chats", schemes:"Schemes Viewed", docs:"Docs Scanned", progress:"Learning Progress", lessonsWord:"lessons", quickActions:"Quick Actions", askAI:"Ask AI Mentor", startLearn:"Start Learning", findSchemes:"Find Schemes", scanDoc:"Scan Document", mentorReady:"AI Mentor is ready", mentorDesc:"Ask about business, farming, or government schemes in your language.", chatNow:"Chat Now", recentActivity:"Recent Activity", noActivity:"No recent activity yet. Start learning!" },
  Hindi:     { hello:"नमस्ते", tagline:"आज आप क्या सीखना या करना चाहते हैं?", lessons:"पाठ पूरे किए", chats:"AI बातचीत", schemes:"योजनाएं देखी", docs:"दस्तावेज़", progress:"सीखने की प्रगति", lessonsWord:"पाठ", quickActions:"त्वरित कार्य", askAI:"AI मेंटर से पूछें", startLearn:"सीखना शुरू करें", findSchemes:"योजनाएं खोजें", scanDoc:"दस्तावेज़ स्कैन करें", mentorReady:"AI मेंटर तैयार है", mentorDesc:"अपनी भाषा में व्यापार, खेती, या सरकारी योजनाओं के बारे में पूछें।", chatNow:"बात करें", recentActivity:"हाल की गतिविधि", noActivity:"कोई हाल की गतिविधि नहीं। कुछ सीखना शुरू करें!" },
  Marathi:   { hello:"नमस्कार", tagline:"आज तुम्हाला काय शिकायचे आहे?", lessons:"पूर्ण धडे", chats:"AI संवाद", schemes:"पाहिलेल्या योजना", docs:"स्कॅन दस्तऐवज", progress:"शिकण्याची प्रगती", lessonsWord:"धडे", quickActions:"त्वरित क्रिया", askAI:"AI मार्गदर्शकाला विचारा", startLearn:"शिकणे सुरू करा", findSchemes:"योजना शोधा", scanDoc:"दस्तऐवज स्कॅन करा", mentorReady:"AI मार्गदर्शक तयार आहे", mentorDesc:"तुमच्या भाषेत व्यवसाय, शेती किंवा सरकारी योजनांबद्दल विचारा.", chatNow:"बोला", recentActivity:"अलीकडील क्रियाकलाप", noActivity:"अद्याप कोणतीही क्रियाकलाप नाही. शिकणे सुरू करा!" },
  Gujarati:  { hello:"નમસ્તે", tagline:"આજે તમે શું શીખવા માંગો છો?", lessons:"પૂર્ણ પાઠ", chats:"AI વાતચીત", schemes:"જોયેલી યોજनाઓ", docs:"સ્કૅન દસ્તાવેજ", progress:"શીખવાની પ્રગતિ", lessonsWord:"પાઠ", quickActions:"ઝડપી ક્રિયાઓ", askAI:"AI માર્ગદર્શક ને પૂછો", startLearn:"શીખવાનું શરૂ કરો", findSchemes:"યોજнаઓ શોધો", scanDoc:"દસ્તાવેજ સ્કૅन करो", mentorReady:"AI માર્ગदर्शक तैयार छे", mentorDesc:"તમારી ભाषामां व्यापार, खेती या सरकारी योजनाओ विशे पूछो.", chatNow:"વાત करो", recentActivity:"તаजेतरी प्रवृत्ति", noActivity:"હजी સுધी कोई प्रवृत्ति नहीं. शीखवानुं शरू करो!" },
  Tamil:     { hello:"வணக்கம்", tagline:"இன்று நீங்கள் என்ன கற்றுக்கொள்ள விரும்புகிறீர்கள்?", lessons:"முடித்த பாடங்கள்", chats:"AI உரையாடல்கள்", schemes:"பார்த்த திட்டங்கள்", docs:"ஸ்கேன் ஆவணங்கள்", progress:"கற்றல் முன்னேற்றம்", lessonsWord:"பாடங்கள்", quickActions:"விரைவு செயல்கள்", askAI:"AI வழிகாட்டியிடம் கேளுங்கள்", startLearn:"கற்றலை தொடங்குங்கள்", findSchemes:"திட்டங்களை கண்டறியுங்கள்", scanDoc:"ஆவணத்தை ஸ்கேன் செய்யுங்கள்", mentorReady:"AI வழிகாட்டி தயார்", mentorDesc:"உங்கள் மொழியில் வியாபாரம், விவசாயம் அல்லது அரசு திட்டங்களைப் பற்றி கேளுங்கள்.", chatNow:"இப்போது பேசுங்கள்", recentActivity:"சமீபத்திய செயல்பாடு", noActivity:"இன்னும் எந்த செயல்பாடும் இல்லை. கற்றலை தொடங்குங்கள்!" },
  Telugu:    { hello:"నమస్కారం", tagline:"మీరు ఈరోజు ఏమి నేర్చుకోవాలనుకుంటున్నారు?", lessons:"పూర్తి చేసిన పాఠాలు", chats:"AI సంభాషణలు", schemes:"చూసిన పథకాలు", docs:"స్కాన్ పత్రాలు", progress:"నేర్చుకునే పురోగతి", lessonsWord:"పాఠాలు", quickActions:"త్వరిత చర్యలు", askAI:"AI మార్గదర్శిని అడగండి", startLearn:"నేర్చుకోవడం ప్రారంభించండి", findSchemes:"పథకాలు వెతకండి", scanDoc:"పత్రాన్ని స్కాన్ చేయండి", mentorReady:"AI మార్గదర్శి సిద్ధంగా ఉంది", mentorDesc:"మీ భాషలో వ్యాపారం, వ్యవసాయం లేదా ప్రభుత్వ పథకాల గురించి అడగండి.", chatNow:"ఇప్పుడు చాట్ చేయండి", recentActivity:"ఇటీవలి కార్యకలాపాలు", noActivity:"ఇంకా ఎటువంటి కార్యకలాపాలు లేవు. నేర్చుకోవడం ప్రారంభించండి!" },
  Kannada:   { hello:"ನಮಸ್ಕಾರ", tagline:"ಇಂದು ನೀವು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?", lessons:"ಮುಗಿಸಿದ ಪಾಠಗಳು", chats:"AI ಸಂಭಾಷಣೆಗಳು", schemes:"ನೋಡಿದ ಯೋಜನೆಗಳು", docs:"ಸ್ಕ್ಯಾನ್ ದಾಖಲೆಗಳು", progress:"ಕಲಿಕೆ ಪ್ರಗತಿ", lessonsWord:"ಪಾಠಗಳು", quickActions:"ತ್ವರಿತ ಕ್ರಿಯೆಗಳು", askAI:"AI ಮಾರ್ಗದರ್ಶಿಯನ್ನು ಕೇಳಿ", startLearn:"ಕಲಿಕೆ ಪ್ರಾರಂಭಿಸಿ", findSchemes:"ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ", scanDoc:"ದಾಖಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ", mentorReady:"AI ಮಾರ್ಗದರ್ಶಿ ಸಿದ್ಧವಾಗಿದೆ", mentorDesc:"ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ವ್ಯಾಪಾರ, ಕೃಷಿ ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ.", chatNow:"ಈಗ ಚಾಟ್ ಮಾಡಿ", recentActivity:"ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ", noActivity:"ಇನ್ನೂ ಯಾವುದೇ ಚಟುವಟಿಕೆ ಇಲ್ಲ. ಕಲಿಕೆ ಪ್ರಾರಂಭಿಸಿ!" },
  Malayalam: { hello:"നമസ്കാരം", tagline:"ഇന്ന് നിങ്ങൾ എന്ത് പഠിക്കാൻ ആഗ്രഹിക്കുന്നു?", lessons:"പൂർത്തിയാക്കിയ പാഠങ്ങൾ", chats:"AI സംഭാഷണങ്ങൾ", schemes:"കണ്ട പദ്ധതികൾ", docs:"സ്കാൻ ചെയ്ത രേഖകൾ", progress:"പഠന പുരോഗതി", lessonsWord:"പാഠങ്ങൾ", quickActions:"ദ്രുത പ്രവർത്തനങ്ങൾ", askAI:"AI വഴികാട്ടിയോട് ചോദിക്കൂ", startLearn:"പഠനം ആരംഭിക്കൂ", findSchemes:"പദ്ധതികൾ കണ്ടെത്തൂ", scanDoc:"രേഖ സ്കാൻ ചെയ്യൂ", mentorReady:"AI വഴികാട്ടി തയ്യാറാണ്", mentorDesc:"നിങ്ങളുടെ ഭാഷയിൽ ബിസിനസ്, കൃഷി അല്ലെങ്കിൽ സർക്കാർ പദ്ധതികളെക്കുറിച്ച് ചോദിക്കൂ.", chatNow:"ഇപ്പോൾ ചാറ്റ് ചെയ്യൂ", recentActivity:"സമീപകാല പ്രവർത്തനം", noActivity:"ഇനിയും പ്രവർത്തനങ്ങളൊന്നുമില്ല. പഠനം ആരംഭിക്കൂ!" },
  Punjabi:   { hello:"ਸਤ ਸ੍ਰੀ ਅਕਾਲ", tagline:"ਅੱਜ ਤੁਸੀਂ ਕੀ ਸਿੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?", lessons:"ਮੁਕੰਮਲ ਪਾਠ", chats:"AI ਗੱਲਬਾਤ", schemes:"ਦੇਖੀਆਂ ਯੋਜਨਾਵਾਂ", docs:"ਸਕੈਨ ਦਸਤਾਵੇਜ਼", progress:"ਸਿੱਖਣ ਦੀ ਤਰੱਕੀ", lessonsWord:"ਪਾਠ", quickActions:"ਤੇਜ਼ ਕਾਰਵਾਈਆਂ", askAI:"AI ਮਾਰਗਦਰਸ਼ਕ ਤੋਂ ਪੁੱਛੋ", startLearn:"ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ", findSchemes:"ਯੋਜਨਾਵਾਂ ਲੱਭੋ", scanDoc:"ਦਸਤਾਵੇਜ਼ ਸਕੈਨ ਕਰੋ", mentorReady:"AI ਮਾਰਗਦਰਸ਼ਕ ਤਿਆਰ ਹੈ", mentorDesc:"ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਕਾਰੋਬਾਰ, ਖੇਤੀ ਜਾਂ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਬਾਰੇ ਪੁੱਛੋ।", chatNow:"ਹੁਣੇ ਗੱਲ ਕਰੋ", recentActivity:"ਹਾਲੀਆ ਗਤੀਵਿਧੀ", noActivity:"ਅਜੇ ਕੋਈ ਗਤੀਵਿਧੀ ਨਹੀਂ। ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ!" },
  Bengali:   { hello:"নমস্কার", tagline:"আজ আপনি কী শিখতে চান?", lessons:"সম্পূর্ণ পাঠ", chats:"AI কথোপকথন", schemes:"দেখা প্রকল্প", docs:"স্ক্যান নথি", progress:"শেখার অগ্রগতি", lessonsWord:"পাঠ", quickActions:"দ্রুত কার্যক্রম", askAI:"AI পরামর্শদাতাকে জিজ্ঞেস করুন", startLearn:"শেখা শুরু করুন", findSchemes:"প্রকল্প খুঁজুন", scanDoc:"নথি স্ক্যান করুন", mentorReady:"AI পরামর্শদাতা প্রস্তুত", mentorDesc:"আপনার ভাষায় ব্যবসা, কৃষি বা সরকারি প্রকল্প সম্পর্কে জিজ্ঞেস করুন।", chatNow:"এখনই চ্যাট করুন", recentActivity:"সাম্প্রতিক কার্যকলাপ", noActivity:"এখনও কোনো কার্যকলাপ নেই। শেখা শুরু করুন!" },
  Urdu:      { hello:"السلام علیکم", tagline:"آج آپ کیا سیکھنا چاہتے ہیں؟", lessons:"مکمل اسباق", chats:"AI گفتگو", schemes:"دیکھی گئی اسکیمیں", docs:"اسکین دستاویزات", progress:"سیکھنے کی پیشرفت", lessonsWord:"اسباق", quickActions:"فوری اقدامات", askAI:"AI رہنما سے پوچھیں", startLearn:"سیکھنا شروع کریں", findSchemes:"اسکیمیں تلاش کریں", scanDoc:"دستاویز اسکین کریں", mentorReady:"AI رہنما تیار ہے", mentorDesc:"اپنی زبان میں کاروبار، کھیتی یا سرکاری اسکیموں کے بارے میں پوچھیں۔", chatNow:"ابھی بات کریں", recentActivity:"حالیہ سرگرمی", noActivity:"ابھی تک کوئی سرگرمی نہیں۔ سیکھنا شروع کریں!" },
  Odia:      { hello:"ନମସ୍କାର", tagline:"ଆଜି ଆପଣ କ'ଣ ଶିଖିବାକୁ ଚାହୁଁଛନ୍ତି?", lessons:"ସମ୍ପୂର୍ଣ ପାଠ", chats:"AI ବାର୍ତ୍ତାଳାପ", schemes:"ଦେଖିଥିବା ଯୋଜନା", docs:"ସ୍କାନ ଦଲିଲ", progress:"ଶିକ୍ଷଣ ଅଗ୍ରଗତି", lessonsWord:"ପାଠ", quickActions:"ତ୍ୱରିତ କାର୍ଯ୍ୟ", askAI:"AI ମାର୍ଗଦର୍ଶକଙ୍କୁ ପଚାରନ୍ତୁ", startLearn:"ଶିକ୍ଷଣ ଆରମ୍ଭ କରନ୍ତୁ", findSchemes:"ଯୋଜନା ଖୋଜନ୍ତୁ", scanDoc:"ଦଲିଲ ସ୍କାନ କରନ୍ତୁ", mentorReady:"AI ମାର୍ଗଦର୍ଶକ ପ୍ରସ୍ତୁତ", mentorDesc:"ଆପଣଙ୍କ ଭାଷାରେ ବ୍ୟବସାୟ, କୃଷି ବା ସରକାରୀ ଯୋଜନା ବିଷୟରେ ପଚାରନ୍ତୁ।", chatNow:"ବର୍ତ୍ତମାନ ଚାଟ୍ କରନ୍ତୁ", recentActivity:"ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟ", noActivity:"ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି କାର୍ଯ୍ୟ ନାହିଁ। ଶିକ୍ଷଣ ଆରମ୍ଭ କରନ୍ତୁ!" },
  Assamese:  { hello:"নমস্কাৰ", tagline:"আজি আপুনি কি শিকিব বিচাৰে?", lessons:"সম্পূৰ্ণ পাঠ", chats:"AI কথোপকথন", schemes:"চোৱা আঁচনি", docs:"স্কেন নথিপত্ৰ", progress:"শিক্ষণ অগ্ৰগতি", lessonsWord:"পাঠ", quickActions:"দ্ৰুত কাৰ্যক্ৰম", askAI:"AI পথ প্ৰদৰ্শকক সুধক", startLearn:"শিকা আৰম্ভ কৰক", findSchemes:"আঁচনি বিচাৰক", scanDoc:"নথিপত্ৰ স্কেন কৰক", mentorReady:"AI পথ প্ৰদৰ্শক সাজু", mentorDesc:"আপোনাৰ ভাষাত ব্যৱসায়, কৃষি বা চৰকাৰী আঁচনিৰ বিষয়ে সুধক।", chatNow:"এতিয়াই চেট কৰক", recentActivity:"শেহতীয়া কাৰ্যকলাপ", noActivity:"এতিয়ালৈকে কোনো কাৰ্যকলাপ নাই। শিকা আৰম্ভ কৰক!" },
};

function t(language: string, key: string): string {
  return UI[language]?.[key] ?? UI["English"][key] ?? key;
}

const QUICK_ACTIONS = [
  { key: "askAI",      href: "/dashboard/chat",    icon: MessageCircle, color: "bg-blue-500" },
  { key: "startLearn", href: "/dashboard/lessons", icon: BookOpen,      color: "bg-green-500" },
  { key: "findSchemes",href: "/dashboard/schemes", icon: Landmark,      color: "bg-purple-500" },
  { key: "scanDoc",    href: "/dashboard/ocr",     icon: FileText,      color: "bg-orange-500" },
];

const ACTIVITY_ICONS: Record<string, { icon: typeof BookOpen; color: string }> = {
  lesson: { icon: BookOpen,      color: "bg-green-100 text-green-600" },
  chat:   { icon: MessageCircle, color: "bg-blue-100 text-blue-600" },
  scheme: { icon: Landmark,      color: "bg-purple-100 text-purple-600" },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { language } = useAppStore();

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiClient.get("/dashboard/summary").then((r) => r.data),
  });

  const stats = summary?.stats ?? {
    completedLessons: 0, totalLessons: 0, progressPercent: 0,
    chatSessions: 0, schemesViewed: 0, documentsScanned: 0,
  };
  const recentActivity: Array<{ type: string; title: string; subtitle: string; timestamp: string }> =
    summary?.recentActivity ?? [];

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">
          {t(language, "hello")}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">{t(language, "tagline")}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: "lessons",  value: stats.completedLessons,  color: "text-green-600" },
          { key: "chats",    value: stats.chatSessions,       color: "text-blue-600" },
          { key: "schemes",  value: stats.schemesViewed,      color: "text-purple-600" },
          { key: "docs",     value: stats.documentsScanned,   color: "text-orange-600" },
        ].map((s, i) => (
          <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t(language, s.key)}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Learning Progress */}
      {stats.totalLessons > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t(language, "progress")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{stats.completedLessons} / {stats.totalLessons} {t(language, "lessonsWord")}</span>
                <span className="font-semibold text-primary">{stats.progressPercent}%</span>
              </div>
              <Progress value={stats.progressPercent} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t(language, "quickActions")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div key={action.href} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Link href={action.href}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-800">{t(language, action.key)}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-saffron-500 to-orange-600 rounded-2xl p-5 text-white flex flex-col justify-between gap-4 min-h-[120px]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm">{t(language, "mentorReady")}</span>
            </div>
            <p className="text-orange-100 text-sm">{t(language, "mentorDesc")}</p>
          </div>
          <Button variant="secondary" size="sm" asChild className="self-start bg-white text-primary hover:bg-orange-50">
            <Link href="/dashboard/chat">{t(language, "chatNow")} <ArrowRight className="w-3 h-3 ml-1" /></Link>
          </Button>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t(language, "recentActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t(language, "noActivity")}</p>
              ) : (
                <ul className="space-y-2">
                  {recentActivity.map((item, i) => {
                    const cfg = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.lesson;
                    const Icon = cfg.icon;
                    return (
                      <li key={i} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                        </div>
                        {item.timestamp && (
                          <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.timestamp)}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
