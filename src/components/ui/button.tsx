"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  block?: boolean;
};

const baseStyles =
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600",
  secondary: "bg-white text-blue-600 shadow hover:bg-blue-50 focus-visible:outline-blue-600",
  ghost: "bg-transparent text-blue-600 hover:bg-blue-50 focus-visible:outline-blue-600",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", block, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        block ? "w-full" : undefined,
        "px-5 py-3",
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
