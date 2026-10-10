"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { getAuthText } from "@/lib/auth-text";
import apiClient from "@/lib/api";

type FormData = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const language = useAppStore((s) => s.language);
  const t = getAuthText(getLangCode(language));
  const [loading, setLoading] = useState(false);

  // Validation messages follow the chosen language
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t.invalidEmail),
        password: z.string().min(1, t.passwordRequired),
      }),
    [t.invalidEmail, t.passwordRequired]
  );

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", data);
      const { access_token, refresh_token } = res.data;

      // Fetch profile
      const profileRes = await apiClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setAuth(profileRes.data, access_token, refresh_token);
      toast.success(t.welcomeToast);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || t.loginFailed;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.welcomeBack}</h1>
        <p className="text-muted-foreground mt-1">{t.signInSub}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.email}</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">{t.password}</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              {t.forgot}
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.signingIn}</> : t.signIn}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t.noAccount}{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          {t.createOne}
        </Link>
      </p>
    </div>
  );
}
