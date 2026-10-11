"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftRight, Copy, Loader2, Languages, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, useAppStore } from "@/store/app.store";
import { t } from "@/lib/translations";
import apiClient from "@/lib/api";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

type PdfResult = {
  fileName: string;
  pageCount: number;
  targetLanguage: string;
  translatedText: string;
};

export default function TranslatePage() {
  const { language } = useAppStore();

  // ---------- Typed text translation ----------
  const [sourceText, setSourceText] = useState("");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [result, setResult] = useState("");

  const mutation = useMutation({
    mutationFn: () => apiClient.post("/translate", { text: sourceText, target_language: targetLang }),
    onSuccess: (res) => setResult(res.data.translatedText),
    onError: () => toast.error("Translation failed"),
  });

  const swap = () => { setSourceText(result); setResult(sourceText); };
  const copy = () => { navigator.clipboard.writeText(result); toast.success("Copied!"); };

  // ---------- PDF translation ----------
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLang, setPdfLang] = useState("Hindi");
  const [pdfResult, setPdfResult] = useState<PdfResult | null>(null);

  const pdfMutation = useMutation({
    mutationFn: async () => {
      if (!pdfFile) throw new Error("No file selected");
      const form = new FormData();
      form.append("file", pdfFile);
      form.append("target_language", pdfLang);
      // Let the browser set the multipart boundary automatically
      return apiClient.post("/translate/pdf-text", form, {
        headers: { "Content-Type": undefined },
      });
    },
    onSuccess: (res) => {
      setPdfResult({
        fileName: pdfFile?.name ?? "document.pdf",
        pageCount: res.data.pageCount,
        targetLanguage: res.data.targetLanguage,
        translatedText: res.data.translatedText,
      });
      toast.success("PDF translated");
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "PDF translation failed");
    },
  });

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPdfResult(null);
    if (file && file.size > MAX_PDF_BYTES) {
      toast.error("File too large. Maximum size is 10MB.");
      setPdfFile(null);
      e.target.value = "";
      return;
    }
    setPdfFile(file);
  }

  function copyPdfText() {
    if (!pdfResult) return;
    navigator.clipboard.writeText(pdfResult.translatedText);
    toast.success("Copied!");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Languages className="w-6 h-6 text-primary" /> {t(language, "translateTitle")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t(language, "translateSubtitle")}</p>
      </div>

      {/* ---------- PDF section ---------- */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b bg-gray-50">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Translate a PDF</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={onPickFile}
            className="text-sm max-w-full"
          />
          <Select value={pdfLang} onValueChange={(v) => { setPdfLang(v); setPdfResult(null); }}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.name}>{l.native} · {l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => pdfMutation.mutate()}
            disabled={!pdfFile || pdfMutation.isPending}
          >
            {pdfMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
            Translate PDF
          </Button>
        </div>

        <div className="p-4 min-h-[8rem] relative">
          {pdfMutation.isPending ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Reading and translating the PDF. This can take a minute for long files.
            </div>
          ) : pdfResult ? (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                {pdfResult.fileName} · {pdfResult.pageCount} page(s) · {pdfResult.targetLanguage}
              </p>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto pr-8">
                {pdfResult.translatedText}
              </div>
              <button
                onClick={copyPdfText}
                className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                aria-label="Copy translated text"
              >
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a PDF and a language, then click Translate PDF. The translated text will appear here.
            </p>
          )}
        </div>
      </div>

      {/* ---------- Typed text section ---------- */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
          <span className="text-sm text-muted-foreground">{t(language, "autoDetect")}</span>
          <button onClick={swap} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors">
            <ArrowLeftRight className="w-4 h-4 text-gray-500" />
          </button>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.name}>{l.native} · {l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 divide-x">
          <div className="p-4">
            <textarea
              className="w-full h-48 text-sm resize-none outline-none placeholder:text-muted-foreground"
              placeholder={t(language, "enterText")}
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">{sourceText.length} {t(language, "chars")}</span>
              <Button size="sm" onClick={() => mutation.mutate()} disabled={!sourceText.trim() || mutation.isPending}>
                {mutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                {t(language, "translateBtn")}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-gray-50/50 relative">
            <div className="w-full h-48 text-sm text-gray-700 overflow-y-auto leading-relaxed">
              {mutation.isPending ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t(language, "translating")}
                </div>
              ) : result || <span className="text-muted-foreground">{t(language, "translationHere")}</span>}
            </div>
            {result && (
              <button onClick={copy} className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-gray-200 transition-colors">
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
