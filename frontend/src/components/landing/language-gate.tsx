"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app.store";

// Voice-first language gate for users who cannot read.
// Plays the same question in 11 languages, one after another. The first tap
// starts the voice (browsers block audio until the user touches the page).
// As soon as the user taps the big button, the voice stops and the whole site
// switches to that language through the app store.

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

  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(false);

  // Refs so timers and audio callbacks always see the latest values
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInteractedRef = useRef(false);
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
    if (p !== undefined) p.catch(onComplete); // blocked or failed: keep cycling
  }

  function advance() {
    if (chosenRef.current) return;
    indexRef.current = (indexRef.current + 1) % GATE_LANGUAGES.length;
    setIndex(indexRef.current);

    if (hasInteractedRef.current) {
      playVoice();
    } else {
      // No touch yet: keep changing the text silently
      timerRef.current = setTimeout(advance, CYCLE_DELAY_MS);
    }
  }

  function markInteracted() {
    if (hasInteractedRef.current || chosenRef.current) return;
    hasInteractedRef.current = true;
    playVoice();
  }

  function choose() {
    if (chosenRef.current) return;
    const item = GATE_LANGUAGES[indexRef.current];
    chosenRef.current = true;
    setChosen(true);

    stopVoice();
    setLanguage(item.name);

    document.documentElement.lang = item.code;
    document.documentElement.dir = item.code === "ur" ? "rtl" : "ltr";

    // Let the fade-out finish, then remove the overlay
    setTimeout(() => setVisible(false), 300);
  }

  useEffect(() => {
    // Start cycling silently; the first touch or key press starts the voice
    timerRef.current = setTimeout(advance, CYCLE_DELAY_MS);

    const onKey = (e: KeyboardEvent) => {
      if (!hasInteractedRef.current) markInteracted();
      if (chosenRef.current) return;
      if ((e.key === " " || e.key === "Enter") && document.activeElement?.id !== "lang-gate-btn") {
        e.preventDefault();
        choose();
      }
    };
    const onVisibility = () => {
      if (document.hidden) stopVoice();
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

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
        id="lang-gate-btn"
        type="button"
        onPointerDown={markInteracted}
        onTouchStart={markInteracted}
        onFocus={markInteracted}
        onClick={choose}
        lang={item.code}
        dir={item.code === "ur" ? "rtl" : "ltr"}
        aria-label={item.text}
        className="flex h-[calc(100dvh-32px)] min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center rounded-[28px] border-[5px] border-slate-800 bg-slate-900 p-8 text-center text-white shadow-2xl transition active:scale-[0.985] focus-visible:outline focus-visible:outline-[6px] focus-visible:outline-offset-[6px] focus-visible:outline-blue-600 select-none"
      >
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

