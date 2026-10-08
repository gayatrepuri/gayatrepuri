import type { ComponentProps, ReactNode } from "react";

// Small shared building blocks so every screen looks the same.

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonStyles: Record<ButtonVariant, string> = {
  // Dark Jungle Green with tint text: contrast 14.9
  primary: "bg-jungle text-jet-tint border border-jungle hover:bg-olive hover:border-olive",
  // Tint with Dark Jungle Green text and a thin border: contrast 14.9
  secondary: "bg-jet-tint text-jungle border border-jungle hover:bg-jet",
  ghost: "bg-transparent text-jungle border border-transparent underline underline-offset-4 hover:bg-jet",
};

export function buttonClass(variant: ButtonVariant = "primary", extra = "") {
  return `inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:border-jet disabled:bg-jet disabled:text-jungle ${buttonStyles[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-wider text-granite">
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`mt-1 block w-full rounded-sm border border-granite bg-jet-tint px-3 py-2 text-sm text-jungle placeholder:text-granite focus:border-jungle ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`border border-jet bg-jet-tint p-6 ${className}`}>{children}</section>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`border-l-2 px-3 py-2 text-sm ${tone === "error" ? "border-jungle bg-jet font-medium" : "border-slate bg-jet-tint"} text-jungle`}
    >
      {children}
    </p>
  );
}
