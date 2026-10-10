"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app.store";

// Voice-first language gate for users who cannot read.
// The voice starts by itself as soon as the page opens. If the browser blocks
// sound until the user touches the screen, the voice starts on the first touch
// anywhere on the screen. The next tap on the big button saves the language
// and goes to the login page in that language.

const CYCLE_DELAY_MS = 3000;

const GATE_LANGUAGES = [
  { code: "en", name: "English", text: "If you understand me, press the big button." },
  { code: "hi", name: "Hindi", text: "अगर आप मुझे समझ रहे हैं, तो बड़ा बटन दबाइए।" },
  { code: "mr", name: "Marathi", text: "तुम्हाला मी समजत असेल, तर मोठे बटण दाबा." },
  { code: "gu", name: "Gujarati", text: "જો તમે મને સમજી શકતા હો, તો મોટું બટન દબાવો." },
  { code: "ta", name: "Tamil", text: "நீங்கள் என்னைப் புரிந்துகொண்டால், பெரிய பொத்தானை அழுத்துங்கள்." },
  { code: "te", name: "Telugu", text: "మీకు నేను చెప్పేది అర్థమైతే, పెద్ద బటన్ నొక్కండి." },
  { code: "kn", name: "Kannada", text: "ನಿಮಗೆ ನಾನು ಹೇಳುವುದು ಅರ್ಥವಾದರೆ, ದೊಡ್ಡ ಬಟನ್ ಒತ್ತಿ." },
  { code: "ml", name: "Malayalam", text: "നിങ്ങൾക്ക് ഞാൻ പറയുന്നത് മനസ്സിലായാൽ, വലിയ ബട്ടൺ അമർത്തുക." },
  { code: "pa", name: "Punjabi", text: "ਜੇ ਤੁਸੀਂ ਮੇਰੀ ਗੱਲ ਸਮਝ ਰਹੇ ਹੋ, ਤਾਂ ਵੱਡਾ ਬਟਨ ਦਬਾਓ।" },
  { code: "bn", name: "Bengali", text: "আপনি যদি আমার কথা বুঝতে পারেন, তাহলে বড় বোতামটি চাপুন।" },
  { code: "ur", name: "Urdu", text: "اگر آپ میری بات سمجھ رہے ہیں تو بڑا بٹن دبائیں۔" },
] as const;

export function LanguageGate() {
  const setLanguage = useAppStore((s) => s.setLanguage);
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [chosen, setChosen] = useState(false);

  // Refs so timers and audio callbacks always see the latest values
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);
  const chosenRef = useRef(false);
  const indexRef = useRef(0);

  function clearTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopAudio() {
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      try {
        a.pause();
        a.removeAttribute("src");
        a.load();
      } catch {
        // ignore teardown errors
      }
      audioRef.current = null;
    }
  }

  function stopVoice() {
    clearTimer();
    stopAudio();
  }

  function playVoice() {
    if (chosenRef.current) return;
    stopVoice();

    const item = GATE_LANGUAGES[indexRef.current];
    const audio = new Audio(`/audio/${item.code}.mp3`);
    audioRef.current = audio;

    let done = false;
    const onComplete = () => {
      if (done || chosenRef.current || audioRef.current !== audio) return;
      done = true;
      // Pause 3 seconds after this sentence, then move to the next language
      timerRef.current = setTimeout(advance, CYCLE_DELAY_MS);
    };

    audio.addEventListener("ended", onComplete, { once: true });
    audio.addEventListener("error", onComplete, { once: true });

    const p = audio.play();
    if (p !== undefined) {
      p.catch((err: unknown) => {
        if ((err as { name?: string })?.name === "NotAllowedError") {
          // Browser blocked sound until the user touches the screen.
          // Go back to "not started" so the next touch starts the voice.
          stopVoice();
          startedRef.current = false;
          setStarted(false);
          timerRef.current = setTimeout(advance, CYCLE_DELAY_MS);
        } else {
          onComplete();
        }
      });
    }
  }

  function advance() {
    if (chosenRef.current) return;
    indexRef.current = (indexRef.current + 1) % GATE_LANGUAGES.length;
    setIndex(indexRef.current);

    if (startedRef.current) {
      playVoice();
    } else {
      // Not started yet: keep changing the text silently
      timerRef.current = setTimeout(advance, CYCLE_DELAY_MS);
    }
  }

  // Start the voice (used on page load, and on the first touch if the browser blocked it)
  function startVoice() {
    if (startedRef.current || chosenRef.current) return;
    clearTimer();
    startedRef.current = true;
    setStarted(true);
    playVoice();
  }

  // Tap on the big button: start if not started yet, otherwise save the language
  function handleButtonTap() {
    if (!startedRef.current) {
      startVoice();
    } else {
      choose();
    }
  }

  // Second tap (after the voice has started): the user understands this language
  function choose() {
    if (chosenRef.current) return;
    const item = GATE_LANGUAGES[indexRef.current];
    chosenRef.current = true;
    setChosen(true);

    stopVoice();
    setLanguage(item.name);

    document.documentElement.lang = item.code;
    document.documentElement.dir = item.code === "ur" ? "rtl" : "ltr";

    router.push("/login");
  }

  useEffect(() => {
    // 1. Try to start the voice right away, with no tap
    startVoice();

    // 2. If the browser blocked it, the first touch or key press anywhere starts it
    const onFirstTouch = (e: Event) => {
      if (startedRef.current || chosenRef.current) return;
      const target = e.target as Node | null;
      // Taps on the big button are handled by the button itself
      if (target && buttonRef.current?.contains(target)) return;
      startVoice();
    };
    const onVisibility = () => {
      if (document.hidden) stopVoice();
    };

    window.addEventListener("pointerdown", onFirstTouch);
    window.addEventListener("keydown", onFirstTouch);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pointerdown", onFirstTouch);
      window.removeEventListener("keydown", onFirstTouch);
      document.removeEventListener("visibilitychange", onVisibility);
      stopVoice();
      startedRef.current = false; // allow the voice to start again on a fresh mount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const item = GATE_LANGUAGES[index];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 p-4 transition-opacity duration-300 ${
        chosen ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={item.text}
    >
      <button
        ref={buttonRef}
        id="lang-gate-btn"
        type="button"
        onClick={handleButtonTap}
        lang={item.code}
        dir={item.code === "ur" ? "rtl" : "ltr"}
        aria-label={item.text}
        className="flex h-[calc(100dvh-32px)] min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center gap-8 rounded-[28px] border-[5px] border-slate-800 bg-slate-900 p-8 text-center text-white shadow-2xl transition active:scale-[0.985] focus-visible:outline focus-visible:outline-[6px] focus-visible:outline-offset-[6px] focus-visible:outline-blue-600 select-none"
      >
        {/* Speaker icon: universal sign for "listen" for people who cannot read */}
        <span aria-hidden="true" className="text-[clamp(4rem,10vw,7rem)] leading-none">
          {started ? "🔊" : "🔈"}
        </span>
        <span
          className="max-w-3xl text-[clamp(2rem,5.2vw,3.8rem)] font-bold leading-snug"
          style={item.code === "ur" ? { fontFamily: '"Noto Nastaliq Urdu", system-ui, sans-serif', lineHeight: 1.7 } : undefined}
        >
          {item.text}
        </span>
      </button>
    </div>
  );
}
