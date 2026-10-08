"use client";

import { useActionState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { joinWaitlist, type WaitlistState } from "@/app/waitlist/actions";

// Styled for the Light Slate Gray waitlist band: Dark Jungle Green text on Light Slate Gray = 4.66 : 1 (AA).
const field =
  "peer block w-full border-0 border-b border-jungle/50 bg-transparent px-0 pb-2 pt-6 text-base text-jungle transition-colors placeholder:text-transparent focus:border-jungle focus:outline-none";
const floatLabel =
  "pointer-events-none absolute left-0 top-6 font-mono text-xs uppercase tracking-[0.16em] text-jungle transition-all duration-200 peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0";

function Field({ name, label, type = "text", required = false, autoComplete }: { name: string; label: string; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div className="relative">
      <input id={`wl-${name}`} name={name} type={type} required={required} autoComplete={autoComplete} placeholder={label} className={field} />
      <label htmlFor={`wl-${name}`} className={floatLabel}>
        {label}
        {required && " *"}
      </label>
    </div>
  );
}

export function WaitlistForm() {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, {});

  if (state.ok) {
    return (
      <div role="status" className="hx-readout flex items-start gap-4 border border-jungle p-6 text-jungle">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-jungle text-jet-tint">
          <Check size={16} strokeWidth={1.5} aria-hidden />
        </span>
        <p className="pt-1">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6" noValidate={false}>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="name" label="Name" required autoComplete="name" />
        <Field name="email" label="Work email" type="email" required autoComplete="email" />
        <Field name="company" label="Company" autoComplete="organization" />
        <Field name="role" label="Role" autoComplete="organization-title" />
      </div>
      {/* Bot trap: hidden from people and screen readers */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.error && (
        <p role="alert" className="border-l-2 border-jungle pl-3 text-sm font-medium text-jungle">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center gap-3 border border-jungle bg-jungle px-7 py-3.5 text-sm font-medium text-jet-tint transition-colors hover:bg-olive hover:border-olive disabled:cursor-wait"
      >
        {pending ? "Joining…" : "Join the waitlist"}
        <ArrowRight size={16} strokeWidth={1.5} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </form>
  );
}
