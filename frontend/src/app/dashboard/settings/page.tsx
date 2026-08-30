"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, User, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore, SUPPORTED_LANGUAGES } from "@/store/app.store";
import apiClient from "@/lib/api";

const OCCUPATIONS = ["Farmer", "MSME Owner", "Student", "Woman Entrepreneur", "Trader", "Artisan", "Other"];
const INDIAN_STATES = ["Andhra Pradesh","Bihar","Gujarat","Haryana","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"];

const UI: Record<string, Record<string, string>> = {
  English:   { title: "Settings", profile: "Profile", fullName: "Full Name", occupation: "Occupation", state: "State", langPref: "Language Preference", prefLang: "Preferred Language", aiNote: "The AI will respond in this language by default.", save: "Save Changes", selectOcc: "Select...", selectState: "Select..." },
  Hindi:     { title: "सेटिंग्स", profile: "प्रोफ़ाइल", fullName: "पूरा नाम", occupation: "पेशा", state: "राज्य", langPref: "भाषा प्राथमिकता", prefLang: "पसंदीदा भाषा", aiNote: "AI डिफ़ॉल्ट रूप से इस भाषा में जवाब देगा।", save: "बदलाव सहेजें", selectOcc: "चुनें...", selectState: "चुनें..." },
  Marathi:   { title: "सेटिंग्ज", profile: "प्रोफाइल", fullName: "पूर्ण नाव", occupation: "व्यवसाय", state: "राज्य", langPref: "भाषा प्राधान्य", prefLang: "पसंतीची भाषा", aiNote: "AI डीफॉल्टनुसार या भाषेत उत्तर देईल.", save: "बदल जतन करा", selectOcc: "निवडा...", selectState: "निवडा..." },
  Gujarati:  { title: "સેટિંગ્સ", profile: "પ્રોફાઇल", fullName: "પૂરું નામ", occupation: "વ્યવસાય", state: "રાજ્ય", langPref: "ભાષા પ્રાધાન્ય", prefLang: "પસંદગીની ભाषा", aiNote: "AI ડિફૉલ્ટ રૂપે આ ભаषামાં જવાб આপশે.", save: "ફેरфар સाچवो", selectOcc: "પસंद кरो...", selectState: "પसंद кरो..." },
  Tamil:     { title: "அமைப்புகள்", profile: "சுயவிவரம்", fullName: "முழு பெயர்", occupation: "தொழில்", state: "மாநிலம்", langPref: "மொழி விருப்பம்", prefLang: "விரும்பிய மொழி", aiNote: "AI இந்த மொழியில் இயல்பாக பதிலளிக்கும்.", save: "மாற்றங்களை சேமி", selectOcc: "தேர்ந்தெடு...", selectState: "தேர்ந்தெடு..." },
  Telugu:    { title: "సెట్టింగులు", profile: "ప్రొఫైల్", fullName: "పూర్తి పేరు", occupation: "వృత్తి", state: "రాష్ట్రం", langPref: "భాష ప్రాధాన్యత", prefLang: "ఇష్టమైన భాష", aiNote: "AI డిఫాల్ట్‌గా ఈ భాషలో స్పందిస్తుంది.", save: "మార్పులు సేవ్ చేయండి", selectOcc: "ఎంచుకోండి...", selectState: "ఎంచుకోండి..." },
  Kannada:   { title: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", profile: "ಪ್ರೊಫೈಲ್", fullName: "ಪೂರ್ಣ ಹೆಸರು", occupation: "ವೃತ್ತಿ", state: "ರಾಜ್ಯ", langPref: "ಭಾಷಾ ಆದ್ಯತೆ", prefLang: "ಆದ್ಯತೆಯ ಭಾಷೆ", aiNote: "AI ಡಿಫಾಲ್ಟ್ ಆಗಿ ಈ ಭಾಷೆಯಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತದೆ.", save: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ", selectOcc: "ಆಯ್ಕೆಮಾಡಿ...", selectState: "ಆಯ್ಕೆಮಾಡಿ..." },
  Malayalam: { title: "ക്രമീകരണങ്ങൾ", profile: "പ്രൊഫൈൽ", fullName: "പൂർണ്ണ പേര്", occupation: "തൊഴിൽ", state: "സംസ്ഥാനം", langPref: "ഭാഷ മുൻഗണന", prefLang: "ഇഷ്ടപ്പെട്ട ഭാഷ", aiNote: "AI ഡിഫോൾട്ടായി ഈ ഭാഷയിൽ പ്രതികരിക്കും.", save: "മാറ്റങ്ങൾ സംരക്ഷിക്കൂ", selectOcc: "തിരഞ്ഞെടുക്കൂ...", selectState: "തിരഞ്ഞെടുക്കൂ..." },
  Punjabi:   { title: "ਸੈਟਿੰਗਾਂ", profile: "ਪ੍ਰੋਫਾਈਲ", fullName: "ਪੂਰਾ ਨਾਮ", occupation: "ਕਿੱਤਾ", state: "ਰਾਜ", langPref: "ਭਾਸ਼ਾ ਤਰਜੀਹ", prefLang: "ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ", aiNote: "AI ਡਿਫਾਲਟ ਰੂਪ ਵਿੱਚ ਇਸ ਭਾਸ਼ਾ ਵਿੱਚ ਜਵਾਬ ਦੇਵੇਗਾ।", save: "ਬਦਲਾਅ ਸੁਰੱਖਿਅਤ ਕਰੋ", selectOcc: "ਚੁਣੋ...", selectState: "ਚੁਣੋ..." },
  Bengali:   { title: "সেটিংস", profile: "প্রোফাইল", fullName: "পুরো নাম", occupation: "পেশা", state: "রাজ্য", langPref: "ভাষা পছন্দ", prefLang: "পছন্দের ভাষা", aiNote: "AI ডিফল্টভাবে এই ভাষায় সাড়া দেবে।", save: "পরিবর্তন সংরক্ষণ করুন", selectOcc: "বেছে নিন...", selectState: "বেছে নিন..." },
  Urdu:      { title: "ترتیبات", profile: "پروفائل", fullName: "پورا نام", occupation: "پیشہ", state: "صوبہ", langPref: "زبان کی ترجیح", prefLang: "پسندیدہ زبان", aiNote: "AI بطور ڈیفالٹ اس زبان میں جواب دے گا۔", save: "تبدیلیاں محفوظ کریں", selectOcc: "منتخب کریں...", selectState: "منتخب کریں..." },
  Odia:      { title: "ସେଟିଂସ", profile: "ପ୍ରୋଫାଇଲ", fullName: "ପୂର୍ଣ ନାମ", occupation: "ବୃତ୍ତି", state: "ରାଜ୍ୟ", langPref: "ଭାଷା ପ୍ରାଧାନ୍ୟ", prefLang: "ପସନ୍ଦିତ ଭାଷା", aiNote: "AI ଡିଫଲ୍ଟ ଭାବରେ ଏହି ଭାଷାରେ ଉତ୍ତର ଦେବ।", save: "ପରିବର୍ତ୍ତନ ସଞ୍ଚୟ କରନ୍ତୁ", selectOcc: "ବାଛନ୍ତୁ...", selectState: "ବାଛନ୍ତୁ..." },
  Assamese:  { title: "ছেটিংছ", profile: "প্ৰফাইল", fullName: "সম্পূৰ্ণ নাম", occupation: "পেচা", state: "ৰাজ্য", langPref: "ভাষাৰ পছন্দ", prefLang: "পছন্দৰ ভাষা", aiNote: "AI ডিফল্টভাৱে এই ভাষাত সঁহাৰি দিব।", save: "পৰিবৰ্তন সংৰক্ষণ কৰক", selectOcc: "বাছক...", selectState: "বাছক..." },
};

function g(language: string, key: string): string {
  return UI[language]?.[key] ?? UI["English"][key] ?? key;
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { language: appLang, setLanguage } = useAppStore();

  const [name, setName] = useState(user?.name ?? "");
  const [occupation, setOccupation] = useState(user?.occupation ?? "");
  const [state, setState] = useState(user?.state ?? "");
  const [language, setLang] = useState(user?.language ?? "English");

  const mutation = useMutation({
    mutationFn: () => apiClient.patch("/users/me", { name, occupation, state, language }),
    onSuccess: (res) => {
      setUser(res.data);
      setLanguage(language);
      toast.success(g(language, "save") + " ✓");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">{g(appLang, "title")}</h1>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />{g(appLang, "profile")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{g(appLang, "fullName")}</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{g(appLang, "occupation")}</Label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger><SelectValue placeholder={g(appLang, "selectOcc")} /></SelectTrigger>
                <SelectContent>{OCCUPATIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{g(appLang, "state")}</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger><SelectValue placeholder={g(appLang, "selectState")} /></SelectTrigger>
                <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" />{g(appLang, "langPref")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>{g(appLang, "prefLang")}</Label>
            <Select value={language} onValueChange={setLang}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(l => <SelectItem key={l.code} value={l.name}>{l.native} · {l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{g(appLang, "aiNote")}</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {g(appLang, "save")}
      </Button>
    </div>
  );
}
