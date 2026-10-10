// Login page text in every language the voice gate offers.
// Odia and Assamese are not in the voice gate, so they fall back to English.

export type AuthText = {
  welcomeBack: string;
  signInSub: string;
  email: string;
  password: string;
  forgot: string;
  signIn: string;
  signingIn: string;
  noAccount: string;
  createOne: string;
  invalidEmail: string;
  passwordRequired: string;
  welcomeToast: string;
  loginFailed: string;
};

const en: AuthText = {
  welcomeBack: "Welcome back",
  signInSub: "Sign in to your BhashaSetu account",
  email: "Email",
  password: "Password",
  forgot: "Forgot password?",
  signIn: "Sign in",
  signingIn: "Signing in...",
  noAccount: "Don't have an account?",
  createOne: "Create one free",
  invalidEmail: "Enter a valid email",
  passwordRequired: "Password is required",
  welcomeToast: "Welcome back!",
  loginFailed: "Login failed",
};

const texts: Record<string, AuthText> = {
  en,
  hi: {
    welcomeBack: "स्वागत है", signInSub: "अपने भाषासेतु खाते में साइन इन करें", email: "ईमेल", password: "पासवर्ड",
    forgot: "पासवर्ड भूल गए?", signIn: "साइन इन करें", signingIn: "साइन इन हो रहा है...", noAccount: "खाता नहीं है?",
    createOne: "मुफ्त खाता बनाएं", invalidEmail: "कृपया सही ईमेल लिखें", passwordRequired: "पासवर्ड ज़रूरी है",
    welcomeToast: "वापस स्वागत है!", loginFailed: "लॉगिन विफल रहा",
  },
  mr: {
    welcomeBack: "स्वागत आहे", signInSub: "तुमच्या भाषासेतु खात्यात साइन इन करा", email: "ईमेल", password: "पासवर्ड",
    forgot: "पासवर्ड विसरलात?", signIn: "साइन इन करा", signingIn: "साइन इन होत आहे...", noAccount: "खाते नाही?",
    createOne: "मोफत खाते तयार करा", invalidEmail: "कृपया योग्य ईमेल टाका", passwordRequired: "पासवर्ड आवश्यक आहे",
    welcomeToast: "पुन्हा स्वागत आहे!", loginFailed: "लॉगिन अयशस्वी",
  },
  gu: {
    welcomeBack: "સ્વાગત છે", signInSub: "તમારા ભાષાસેતુ એકાઉન્ટમાં સાઇન ઇન કરો", email: "ઇમેઇલ", password: "પાસવર્ડ",
    forgot: "પાસવર્ડ ભૂલી ગયા?", signIn: "સાઇન ઇન કરો", signingIn: "સાઇન ઇન થઈ રહ્યું છે...", noAccount: "એકાઉન્ટ નથી?",
    createOne: "મફત એકાઉન્ટ બનાવો", invalidEmail: "સાચું ઇમેઇલ લખો", passwordRequired: "પાસવર્ડ જરૂરી છે",
    welcomeToast: "ફરી સ્વાગત છે!", loginFailed: "લૉગિન નિષ્ફળ",
  },
  ta: {
    welcomeBack: "மீண்டும் வருக", signInSub: "உங்கள் பாஷாசேது கணக்கில் உள்நுழையவும்", email: "மின்னஞ்சல்", password: "கடவுச்சொல்",
    forgot: "கடவுச்சொல்லை மறந்துவிட்டீர்களா?", signIn: "உள்நுழைக", signingIn: "உள்நுழைகிறது...", noAccount: "கணக்கு இல்லையா?",
    createOne: "இலவசக் கணக்கை உருவாக்கவும்", invalidEmail: "சரியான மின்னஞ்சலை உள்ளிடவும்", passwordRequired: "கடவுச்சொல் தேவை",
    welcomeToast: "மீண்டும் வரவேற்கிறோம்!", loginFailed: "உள்நுழைவு தோல்வியடைந்தது",
  },
  te: {
    welcomeBack: "తిరిగి స్వాగతం", signInSub: "మీ భాషాసేతు ఖాతాలో సైన్ ఇన్ చేయండి", email: "ఇమెయిల్", password: "పాస్‌వర్డ్",
    forgot: "పాస్‌వర్డ్ మర్చిపోయారా?", signIn: "సైన్ ఇన్", signingIn: "సైన్ ఇన్ అవుతోంది...", noAccount: "ఖాతా లేదా?",
    createOne: "ఉచిత ఖాతాను సృష్టించండి", invalidEmail: "సరైన ఇమెయిల్ నమోదు చేయండి", passwordRequired: "పాస్‌వర్డ్ అవసరం",
    welcomeToast: "మళ్ళీ స్వాగతం!", loginFailed: "లాగిన్ విఫలమైంది",
  },
  kn: {
    welcomeBack: "ಮರಳಿ ಸ್ವಾಗತ", signInSub: "ನಿಮ್ಮ ಭಾಷಾಸೇತು ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ", email: "ಇಮೇಲ್", password: "ಪಾಸ್‌ವರ್ಡ್",
    forgot: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?", signIn: "ಸೈನ್ ಇನ್", signingIn: "ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...", noAccount: "ಖಾತೆ ಇಲ್ಲವೇ?",
    createOne: "ಉಚಿತ ಖಾತೆ ರಚಿಸಿ", invalidEmail: "ಮಾನ್ಯ ಇಮೇಲ್ ನಮೂದಿಸಿ", passwordRequired: "ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯ",
    welcomeToast: "ಮತ್ತೆ ಸ್ವಾಗತ!", loginFailed: "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ",
  },
  ml: {
    welcomeBack: "സ്വാഗതം വീണ്ടും", signInSub: "നിങ്ങളുടെ ഭാഷാസേതു അക്കൗണ്ടിലേക്ക് സൈൻ ഇൻ ചെയ്യുക", email: "ഇമെയിൽ", password: "പാസ്‌വേഡ്",
    forgot: "പാസ്‌വേഡ് മറന്നോ?", signIn: "സൈൻ ഇൻ", signingIn: "സൈൻ ഇൻ ചെയ്യുന്നു...", noAccount: "അക്കൗണ്ട് ഇല്ലേ?",
    createOne: "സൗജന്യ അക്കൗണ്ട് ഉണ്ടാക്കൂ", invalidEmail: "സാധുവായ ഇമെയിൽ നൽകുക", passwordRequired: "പാസ്‌വേഡ് ആവശ്യമാണ്",
    welcomeToast: "വീണ്ടും സ്വാഗതം!", loginFailed: "ലോഗിൻ പരാജയപ്പെട്ടു",
  },
  pa: {
    welcomeBack: "ਜੀ ਆਇਆਂ ਨੂੰ", signInSub: "ਆਪਣੇ ਭਾਸ਼ਾਸੇਤੂ ਖਾਤੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ", email: "ਈਮੇਲ", password: "ਪਾਸਵਰਡ",
    forgot: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?", signIn: "ਸਾਈਨ ਇਨ", signingIn: "ਸਾਈਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ...", noAccount: "ਖਾਤਾ ਨਹੀਂ ਹੈ?",
    createOne: "ਮੁਫ਼ਤ ਖਾਤਾ ਬਣਾਓ", invalidEmail: "ਸਹੀ ਈਮੇਲ ਦਾਖਲ ਕਰੋ", passwordRequired: "ਪਾਸਵਰਡ ਲੋੜੀਂਦਾ ਹੈ",
    welcomeToast: "ਮੁੜ ਜੀ ਆਇਆਂ ਨੂੰ!", loginFailed: "ਲੌਗਇਨ ਅਸਫਲ",
  },
  bn: {
    welcomeBack: "স্বাগতম", signInSub: "আপনার ভাষাসেতু অ্যাকাউন্টে সাইন ইন করুন", email: "ইমেল", password: "পাসওয়ার্ড",
    forgot: "পাসওয়ার্ড ভুলে গেছেন?", signIn: "সাইন ইন", signingIn: "সাইন ইন হচ্ছে...", noAccount: "অ্যাকাউন্ট নেই?",
    createOne: "বিনামূল্যে অ্যাকাউন্ট তৈরি করুন", invalidEmail: "সঠিক ইমেল লিখুন", passwordRequired: "পাসওয়ার্ড প্রয়োজন",
    welcomeToast: "আবার স্বাগতম!", loginFailed: "লগইন ব্যর্থ হয়েছে",
  },
  ur: {
    welcomeBack: "خوش آمدید", signInSub: "اپنے بھاشا سیتو اکاؤنٹ میں سائن ان کریں", email: "ای میل", password: "پاس ورڈ",
    forgot: "پاس ورڈ بھول گئے؟", signIn: "سائن ان کریں", signingIn: "سائن ان ہو رہا ہے...", noAccount: "اکاؤنٹ نہیں ہے؟",
    createOne: "مفت اکاؤنٹ بنائیں", invalidEmail: "درست ای میل درج کریں", passwordRequired: "پاس ورڈ ضروری ہے",
    welcomeToast: "دوبارہ خوش آمدید!", loginFailed: "لاگ ان ناکام ہوا",
  },
};

// code = "hi", "ur", ... ; anything not listed uses English
export function getAuthText(code: string): AuthText {
  return texts[code] ?? en;
}
