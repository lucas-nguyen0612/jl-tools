"use client";

import { type CSSProperties, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/features/auth/actions";

interface LogoutButtonProps {
  children?: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

export function LogoutButton({
  children,
  ...props
}: LogoutButtonProps) {
  const t = useTranslations();
  const router = useRouter();

  const logout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <Button onClick={logout} {...props}>
      {children ?? t("auth.logout")}
    </Button>
  );
}
