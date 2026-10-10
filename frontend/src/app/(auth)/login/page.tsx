"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore, getLangCode } from "@/store/app.store";
import apiClient from "@/lib/api";

type T = {
  title: string; sub: string; name: string; mobile: string; code: string;
  namePh: string; signIn: string; signingIn: string;
  nameErr: string; mobileErr: string; codeErr: string;
  wrongCode: string; notReady: string; failed: string; welcome: string;
};

const en: T = {
  title: "Sign in", sub: "Enter your name, mobile number and code",
  name: "Name", mobile: "Mobile number", code: "Code", namePh: "Your name",
  signIn: "Sign in", signingIn: "Signing in...",
  nameErr: "Please enter your name", mobileErr: "Enter a valid 10-digit mobile number", codeErr: "Enter the code",
  wrongCode: "Wrong code. Please try again.", notReady: "Sign-in is not available right now.",
  failed: "Sign in failed. Please try again.", welcome: "Welcome",
};

const texts: Record<string, T> = {
  en,
  hi: { title: "साइन इन", sub: "अपना नाम, मोबाइल नंबर और कोड लिखें", name: "नाम", mobile: "मोबाइल नंबर", code: "कोड", namePh: "अपना नाम", signIn: "साइन इन करें", signingIn: "साइन इन हो रहा है...", nameErr: "कृपया अपना नाम लिखें", mobileErr: "सही 10 अंकों का मोबाइल नंबर लिखें", codeErr: "कोड लिखें", wrongCode: "गलत कोड। फिर से कोशिश करें।", notReady: "अभी साइन इन उपलब्ध नहीं है।", failed: "साइन इन विफल रहा। फिर से कोशिश करें।", welcome: "स्वागत है" },
  mr: { title: "साइन इन", sub: "तुमचे नाव, मोबाइल नंबर आणि कोड टाका", name: "नाव", mobile: "मोबाइल नंबर", code: "कोड", namePh: "तुमचे नाव", signIn: "साइन इन करा", signingIn: "साइन इन होत आहे...", nameErr: "कृपया तुमचे नाव टाका", mobileErr: "योग्य १० अंकी मोबाइल नंबर टाका", codeErr: "कोड टाका", wrongCode: "चुकीचा कोड. पुन्हा प्रयत्न करा.", notReady: "सध्या साइन इन उपलब्ध नाही.", failed: "साइन इन अयशस्वी. पुन्हा प्रयत्न करा.", welcome: "स्वागत आहे" },
  gu: { title: "સાઇન ઇન", sub: "તમારું નામ, મોબાઇલ નંબર અને કોડ લખો", name: "નામ", mobile: "મોબાઇલ નંબર", code: "કોડ", namePh: "તમારું નામ", signIn: "સાઇન ઇન કરો", signingIn: "સાઇન ઇન થઈ રહ્યું છે...", nameErr: "કૃપા કરીને તમારું નામ લખો", mobileErr: "સાચો ૧૦ અંકનો મોબાઇલ નંબર લખો", codeErr: "કોડ લખો", wrongCode: "ખોટો કોડ. ફરી પ્રયાસ કરો.", notReady: "હમણાં સાઇન ઇન ઉપલબ્ધ નથી.", failed: "સાઇન ઇન નિષ્ફળ. ફરી પ્રયાસ કરો.", welcome: "સ્વાગત છે" },
  ta: { title: "உள்நுழைக", sub: "உங்கள் பெயர், கைபேசி எண் மற்றும் குறியீட்டை உள்ளிடவும்", name: "பெயர்", mobile: "கைபேசி எண்", code: "குறியீடு", namePh: "உங்கள் பெயர்", signIn: "உள்நுழைக", signingIn: "உள்நுழைகிறது...", nameErr: "உங்கள் பெயரை உள்ளிடவும்", mobileErr: "சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்", codeErr: "குறியீட்டை உள்ளிடவும்", wrongCode: "தவறான குறியீடு. மீண்டும் முயற்சிக்கவும்.", notReady: "இப்போது உள்நுழைவு கிடைக்கவில்லை.", failed: "உள்நுழைவு தோல்வி. மீண்டும் முயற்சிக்கவும்.", welcome: "வரவேற்கிறோம்" },
  te: { title: "సైన్ ఇన్", sub: "మీ పేరు, మొబైల్ నంబర్, కోడ్ నమోదు చేయండి", name: "పేరు", mobile: "మొబైల్ నంబర్", code: "కోడ్", namePh: "మీ పేరు", signIn: "సైన్ ఇన్", signingIn: "సైన్ ఇన్ అవుతోంది...", nameErr: "దయచేసి మీ పేరు నమోదు చేయండి", mobileErr: "సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి", codeErr: "కోడ్ నమోదు చేయండి", wrongCode: "తప్పు కోడ్. మళ్ళీ ప్రయత్నించండి.", notReady: "ప్రస్తుతం సైన్ ఇన్ అందుబాటులో లేదు.", failed: "సైన్ ఇన్ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.", welcome: "స్వాగతం" },
  kn: { title: "ಸೈನ್ ಇನ್", sub: "ನಿಮ್ಮ ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಕೋಡ್ ನಮೂದಿಸಿ", name: "ಹೆಸರು", mobile: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", code: "ಕೋಡ್", namePh: "ನಿಮ್ಮ ಹೆಸರು", signIn: "ಸೈನ್ ಇನ್", signingIn: "ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...", nameErr: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ", mobileErr: "ಮಾನ್ಯ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ", codeErr: "ಕೋಡ್ ನಮೂದಿಸಿ", wrongCode: "ತಪ್ಪು ಕೋಡ್. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", notReady: "ಈಗ ಸೈನ್ ಇನ್ ಲಭ್ಯವಿಲ್ಲ.", failed: "ಸೈನ್ ಇನ್ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", welcome: "ಸ್ವಾಗತ" },
  ml: { title: "സൈൻ ഇൻ", sub: "നിങ്ങളുടെ പേര്, മൊബൈൽ നമ്പർ, കോഡ് നൽകുക", name: "പേര്", mobile: "മൊബൈൽ നമ്പർ", code: "കോഡ്", namePh: "നിങ്ങളുടെ പേര്", signIn: "സൈൻ ഇൻ", signingIn: "സൈൻ ഇൻ ചെയ്യുന്നു...", nameErr: "ദയവായി നിങ്ങളുടെ പേര് നൽകുക", mobileErr: "സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക", codeErr: "കോഡ് നൽകുക", wrongCode: "തെറ്റായ കോഡ്. വീണ്ടും ശ്രമിക്കുക.", notReady: "ഇപ്പോൾ സൈൻ ഇൻ ലഭ്യമല്ല.", failed: "സൈൻ ഇൻ പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക.", welcome: "സ്വാഗതം" },
  pa: { title: "ਸਾਈਨ ਇਨ", sub: "ਆਪਣਾ ਨਾਮ, ਮੋਬਾਈਲ ਨੰਬਰ ਅਤੇ ਕੋਡ ਲਿਖੋ", name: "ਨਾਮ", mobile: "ਮੋਬਾਈਲ ਨੰਬਰ", code: "ਕੋਡ", namePh: "ਤੁਹਾਡਾ ਨਾਮ", signIn: "ਸਾਈਨ ਇਨ ਕਰੋ", signingIn: "ਸਾਈਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ...", nameErr: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਲਿਖੋ", mobileErr: "ਸਹੀ 10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਲਿਖੋ", codeErr: "ਕੋਡ ਲਿਖੋ", wrongCode: "ਗਲਤ ਕੋਡ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", notReady: "ਇਸ ਵੇਲੇ ਸਾਈਨ ਇਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।", failed: "ਸਾਈਨ ਇਨ ਅਸਫਲ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", welcome: "ਜੀ ਆਇਆਂ ਨੂੰ" },
  bn: { title: "সাইন ইন", sub: "আপনার নাম, মোবাইল নম্বর ও কোড লিখুন", name: "নাম", mobile: "মোবাইল নম্বর", code: "কোড", namePh: "আপনার নাম", signIn: "সাইন ইন করুন", signingIn: "সাইন ইন হচ্ছে...", nameErr: "অনুগ্রহ করে আপনার নাম লিখুন", mobileErr: "সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন", codeErr: "কোড লিখুন", wrongCode: "ভুল কোড। আবার চেষ্টা করুন।", notReady: "এখন সাইন ইন পাওয়া যাচ্ছে না।", failed: "সাইন ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", welcome: "স্বাগতম" },
  ur: { title: "سائن ان", sub: "اپنا نام، موبائل نمبر اور کوڈ درج کریں", name: "نام", mobile: "موبائل نمبر", code: "کوڈ", namePh: "اپنا نام", signIn: "سائن ان کریں", signingIn: "سائن ان ہو رہا ہے...", nameErr: "براہ کرم اپنا نام درج کریں", mobileErr: "درست 10 ہندسوں کا موبائل نمبر درج کریں", codeErr: "کوڈ درج کریں", wrongCode: "غلط کوڈ۔ دوبارہ کوشش کریں۔", notReady: "ابھی سائن ان دستیاب نہیں ہے۔", failed: "سائن ان ناکام ہوا۔ دوبارہ کوشش کریں۔", welcome: "خوش آمدید" },
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const language = useAppStore((s) => s.language);
  const t = texts[getLangCode(language)] ?? en;
  const [loading, setLoading] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t.nameErr),
        mobile: z.string().regex(/^[6-9]\d{9}$/, t.mobileErr),
        otp: z.string().trim().min(1, t.codeErr),
      }),
    [t.nameErr, t.mobileErr, t.codeErr]
  );

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/demo-login", data);
      const { access_token, refresh_token } = res.data;

      const profileRes = await apiClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setAuth(profileRes.data, access_token, refresh_token);
      toast.success(`${t.welcome}, ${data.name}!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      // 401 = wrong code, 404 = demo sign-in is switched off on the server
      const msg = status === 401 ? t.wrongCode : status === 404 ? t.notReady : t.failed;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.sub}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-base">{t.name}</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            className="h-14 text-lg"
            placeholder={t.namePh}
            {...register("name")}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mobile" className="text-base">{t.mobile}</Label>
          <Input
            id="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            className="h-14 text-lg tracking-wider"
            placeholder="9876543210"
            {...register("mobile")}
          />
          {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="otp" className="text-base">{t.code}</Label>
          <Input
            id="otp"
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="h-14 text-lg tracking-widest"
            placeholder="******"
            {...register("otp")}
          />
          {errors.otp && <p className="text-sm text-destructive">{errors.otp.message}</p>}
        </div>

        <Button type="submit" className="w-full h-14 text-lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t.signingIn}
            </>
          ) : (
            t.signIn
          )}
        </Button>
      </form>
    </div>
  );
}
