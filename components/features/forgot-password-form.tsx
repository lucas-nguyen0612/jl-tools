"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth/error-map";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      const errLike =
        error && typeof error === "object"
          ? (error as { message?: string; code?: string })
          : { message: String(error) };
      setError(t(mapAuthError(errLike)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("auth.forgotPassword.successTitle")}</CardTitle>
            <CardDescription>{t("auth.forgotPassword.successSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("auth.forgotPassword.successDescription")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("auth.forgotPassword.title")}</CardTitle>
            <CardDescription>
              {t("auth.forgotPassword.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("auth.forgotPassword.emailLabel")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.forgotPassword.emailPlaceholder")}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {t("auth.forgotPassword.haveAccountText")}{" "}
                <Link
                  href="/sign-in"
                  className="underline underline-offset-4"
                >
                  {t("auth.forgotPassword.signInLink")}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
