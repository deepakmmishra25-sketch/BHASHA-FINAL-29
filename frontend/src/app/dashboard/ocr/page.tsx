"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileText, Upload, Copy, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore, SUPPORTED_LANGUAGES } from "@/store/app.store";
import apiClient from "@/lib/api";

const UI: Record<string, Record<string, string>> = {
  English:   { title: "Scan Document", subtitle: "Extract text from images and documents — Aadhaar, land records, crop certificates", extractIn: "Extract in:", drop: "Drop a file or click to upload", formats: "PNG, JPG, WebP, or PDF — max 10MB", extracting: "Extracting...", extract: "Extract Text", extracted: "Extracted Text" },
  Hindi:     { title: "दस्तावेज़ स्कैन", subtitle: "छवियों और दस्तावेज़ों से टेक्स्ट निकालें — आधार, भूमि रिकॉर्ड, फसल प्रमाणपत्र", extractIn: "में निकालें:", drop: "फ़ाइल यहाँ छोड़ें या क्लिक करें", formats: "PNG, JPG, WebP, या PDF — अधिकतम 10MB", extracting: "निकाल रहे हैं...", extract: "टेक्स्ट निकालें", extracted: "निकाला गया पाठ" },
  Marathi:   { title: "दस्तऐवज स्कॅन", subtitle: "प्रतिमा आणि दस्तऐवजांमधून मजकूर काढा — आधार, जमीन नोंदी, पीक प्रमाणपत्रे", extractIn: "मध्ये काढा:", drop: "फाइल येथे टाका किंवा क्लिक करा", formats: "PNG, JPG, WebP, किंवा PDF — कमाल 10MB", extracting: "काढत आहे...", extract: "मजकूर काढा", extracted: "काढलेला मजकूर" },
  Gujarati:  { title: "દસ્તaવeજ સ્કેн", subtitle: "છбી અने дsтaвeжомaंथи टेक्स्ट काढо — आधार, जमीन नोंध, पाक प्रमाणपत्र", extractIn: "мां каढо:", drop: "फаइल येथे टाका या क्लिक करो", formats: "PNG, JPG, WebP, या PDF — अधिकतम 10MB", extracting: "каढी रह्या छे...", extract: "टेक्स्ट काढो", extracted: "काढेло мजкूर" },
  Tamil:     { title: "ஆவணம் ஸ்கேன்", subtitle: "படங்கள் மற்றும் ஆவணங்களிலிருந்து உரையை பிரித்தெடுங்கள் — ஆதார், நில பதிவுகள், பயிர் சான்றிதழ்கள்", extractIn: "மொழியில் பிரித்தெடு:", drop: "கோப்பை இங்கே போடுங்கள் அல்லது கிளிக் செய்யுங்கள்", formats: "PNG, JPG, WebP, அல்லது PDF — அதிகபட்சம் 10MB", extracting: "பிரித்தெடுக்கிறது...", extract: "உரையை பிரித்தெடு", extracted: "பிரித்தெடுக்கப்பட்ட உரை" },
  Telugu:    { title: "పత్రాన్ని స్కాన్ చేయండి", subtitle: "చిత్రాలు మరియు పత్రాల నుండి వచనాన్ని సేకరించండి — ఆధార్, భూమి రికార్డులు, పంట ధృవపత్రాలు", extractIn: "లో సేకరించండి:", drop: "ఫైల్‌ను ఇక్కడ వదలండి లేదా క్లిక్ చేయండి", formats: "PNG, JPG, WebP, లేదా PDF — గరిష్టంగా 10MB", extracting: "సేకరిస్తోంది...", extract: "వచనాన్ని సేకరించండి", extracted: "సేకరించిన వచనం" },
  Kannada:   { title: "ದಾಖಲೆ ಸ್ಕ್ಯಾನ್", subtitle: "ಚಿತ್ರಗಳು ಮತ್ತು ದಾಖಲೆಗಳಿಂದ ಪಠ್ಯ ಹೊರತೆಗೆಯಿರಿ — ಆಧಾರ್, ಭೂಮಿ ದಾಖಲೆಗಳು, ಬೆಳೆ ಪ್ರಮಾಣಪತ್ರಗಳು", extractIn: "ಭಾಷೆಯಲ್ಲಿ ಹೊರತೆಗೆಯಿರಿ:", drop: "ಫೈಲ್ ಇಲ್ಲಿ ಬಿಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ", formats: "PNG, JPG, WebP, ಅಥವಾ PDF — ಗರಿಷ್ಠ 10MB", extracting: "ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ...", extract: "ಪಠ್ಯ ಹೊರತೆಗೆಯಿರಿ", extracted: "ಹೊರತೆಗೆದ ಪಠ್ಯ" },
  Malayalam: { title: "രേഖ സ്കാൻ", subtitle: "ചിത്രങ്ങളിൽ നിന്നും രേഖകളിൽ നിന്നും വാചകം എടുക്കൂ — ആധാർ, ഭൂമി രേഖകൾ, വിള സർട്ടിഫിക്കറ്റുകൾ", extractIn: "ഭാഷയിൽ എടുക്കൂ:", drop: "ഫയൽ ഇവിടെ ഇടൂ അല്ലെങ്കിൽ ക്ലിക്ക് ചെയ്യൂ", formats: "PNG, JPG, WebP, അല്ലെങ്കിൽ PDF — പരമാവധി 10MB", extracting: "എടുക്കുന്നു...", extract: "വാചകം എടുക്കൂ", extracted: "എടുത്ത വാചകം" },
  Punjabi:   { title: "ਦਸਤਾਵੇਜ਼ ਸਕੈਨ", subtitle: "ਤਸਵੀਰਾਂ ਅਤੇ ਦਸਤਾਵੇਜ਼ਾਂ ਤੋਂ ਟੈਕਸਟ ਕੱਢੋ — ਆਧਾਰ, ਜ਼ਮੀਨ ਦੇ ਰਿਕਾਰਡ, ਫਸਲ ਸਰਟੀਫਿਕੇਟ", extractIn: "ਭਾਸ਼ਾ ਵਿੱਚ ਕੱਢੋ:", drop: "ਫਾਈਲ ਇੱਥੇ ਸੁੱਟੋ ਜਾਂ ਕਲਿੱਕ ਕਰੋ", formats: "PNG, JPG, WebP, ਜਾਂ PDF — ਵੱਧ ਤੋਂ ਵੱਧ 10MB", extracting: "ਕੱਢ ਰਹੇ ਹਾਂ...", extract: "ਟੈਕਸਟ ਕੱਢੋ", extracted: "ਕੱਢਿਆ ਟੈਕਸਟ" },
  Bengali:   { title: "নথি স্ক্যান", subtitle: "ছবি এবং নথি থেকে টেক্সট বের করুন — আধার, জমির রেকর্ড, ফসলের সনদ", extractIn: "ভাষায় বের করুন:", drop: "ফাইল এখানে ফেলুন বা ক্লিক করুন", formats: "PNG, JPG, WebP, বা PDF — সর্বোচ্চ 10MB", extracting: "বের করা হচ্ছে...", extract: "টেক্সট বের করুন", extracted: "বের করা টেক্সট" },
  Urdu:      { title: "دستاویز اسکین", subtitle: "تصاویر اور دستاویزات سے متن نکالیں — آدھار، زمین کے ریکارڈ، فصل کے سرٹیفکیٹ", extractIn: "زبان میں نکالیں:", drop: "فائل یہاں چھوڑیں یا کلک کریں", formats: "PNG, JPG, WebP, یا PDF — زیادہ سے زیادہ 10MB", extracting: "نکال رہے ہیں...", extract: "متن نکالیں", extracted: "نکالا گیا متن" },
  Odia:      { title: "ଦଲିଲ ସ୍କାନ", subtitle: "ଛବି ଏବଂ ଦଲିଲରୁ ପାଠ ବାହାର କରନ୍ତୁ — ଆଧାର, ଜମି ରେକର୍ଡ, ଫସଲ ସାର୍ଟିଫିକେଟ", extractIn: "ଭାଷାରେ ବାହାର କରନ୍ତୁ:", drop: "ଫାଇଲ ଏଠାରେ ଦିଅନ୍ତୁ ବା କ୍ଲିକ କରନ୍ତୁ", formats: "PNG, JPG, WebP, ବା PDF — ସର୍ବୋଚ୍ଚ 10MB", extracting: "ବାହାର କରୁଛି...", extract: "ପାଠ ବାହାର କରନ୍ତୁ", extracted: "ବାହାର ହୋଇଥିବା ପାଠ" },
  Assamese:  { title: "নথিপত্ৰ স্কেন", subtitle: "ছবি আৰু নথিপত্ৰৰ পৰা পাঠ উলিয়াওক — আধাৰ, মাটিৰ তথ্য, শস্যৰ প্ৰমাণপত্ৰ", extractIn: "ভাষাত উলিয়াওক:", drop: "ফাইল ইয়াত দিয়ক বা ক্লিক কৰক", formats: "PNG, JPG, WebP, বা PDF — সৰ্বাধিক 10MB", extracting: "উলিয়াই আছে...", extract: "পাঠ উলিয়াওক", extracted: "উলিওৱা পাঠ" },
};

function o(language: string, key: string): string {
  return UI[language]?.[key] ?? UI["English"][key] ?? key;
}

export default function OCRPage() {
  const { language } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState(language);
  const [result, setResult] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("file", file!);
      form.append("language", targetLang);
      return apiClient.post("/ocr/extract", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: (res) => { setResult(res.data.extractedText); toast.success("Text extracted!"); },
    onError: () => toast.error("OCR failed — check file format or API key"),
  });

  const handleFile = (f: File) => {
    setFile(f);
    setResult("");
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const clear = () => { setFile(null); setPreview(null); setResult(""); };
  const copy = () => { navigator.clipboard.writeText(result); toast.success("Copied!"); };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> {o(language, "title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{o(language, "subtitle")}</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{o(language, "extractIn")}</span>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(l => <SelectItem key={l.code} value={l.name}>{l.native} · {l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {!file ? (
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">{o(language, "drop")}</p>
            <p className="text-xs text-muted-foreground mt-1">{o(language, "formats")}</p>
            <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                <span className="text-muted-foreground text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={clear}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
            </div>
            {preview && <img src={preview} alt="preview" className="max-h-48 rounded-lg object-contain mx-auto" />}
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="w-full">
              {mutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{o(language, "extracting")}</>
                : o(language, "extract")}
            </Button>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 rounded-xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{o(language, "extracted")}</span>
              <button onClick={copy} className="p-1 hover:bg-gray-200 rounded transition-colors"><Copy className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
