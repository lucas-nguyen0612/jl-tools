"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const NOTICE_KEYS = ["error", "warning", "success", "info"] as const;

type NoticeType = (typeof NOTICE_KEYS)[number];

type Notice = {
  type: NoticeType;
  message: string;
};

const NOTICE_STYLES: Record<NoticeType, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

const NOTICE_TITLES: Record<NoticeType, string> = {
  error: "Something went wrong",
  warning: "Please double-check",
  success: "Success",
  info: "FYI",
};

export function NotificationCenter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);

  const nextNotice = useMemo<Notice | null>(() => {
    for (const key of NOTICE_KEYS) {
      const value = searchParams.get(key);
      if (value) {
        return { type: key, message: value };
      }
    }
    return null;
  }, [searchParams]);

  useEffect(() => {
    setNotice(nextNotice);
  }, [nextNotice]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => {
      clearNotice();
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function clearNotice() {
    const params = new URLSearchParams(searchParams.toString());
    NOTICE_KEYS.forEach((key) => params.delete(key));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  if (!notice) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 top-4 z-50 flex justify-center sm:left-auto sm:right-6 sm:justify-end">
      <div
        role={notice.type === "error" || notice.type === "warning" ? "alert" : "status"}
        className={cn(
          "w-full max-w-md rounded-lg border px-4 py-3 text-sm shadow-lg",
          NOTICE_STYLES[notice.type]
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide">
              {NOTICE_TITLES[notice.type]}
            </p>
            <p className="mt-1 text-sm">{notice.message}</p>
          </div>
          <button
            type="button"
            onClick={clearNotice}
            className="rounded-md border border-transparent px-2 py-1 text-xs font-medium text-current hover:border-black/10"
            aria-label="Dismiss notification"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
