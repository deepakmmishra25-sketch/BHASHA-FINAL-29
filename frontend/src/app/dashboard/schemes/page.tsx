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
  Gujarati:  { title: "સરકારી યોજનાઓ", subtitle: "તમારા માટે યોગ્ય સરકારી યોજના શોધો", aiTitle: "AI સાથે યોજना શોધો", aiPlaceholder: "દા.ત. હું ખેડૂત છું અને શાકભાજી ઉગાડવા ચાહું છું", askAI:
