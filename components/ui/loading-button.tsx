"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LoadingButtonProps = ButtonProps & {
  loadingText?: string;
  spinnerClassName?: string;
};

export function LoadingButton({
  children,
  loadingText = "Working...",
  spinnerClassName,
  disabled,
  ...props
}: LoadingButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <Button
      {...props}
      disabled={isDisabled}
      aria-busy={pending}
      aria-live="polite"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span
            className={cn(
              "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
              spinnerClassName
            )}
            aria-hidden="true"
          />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
