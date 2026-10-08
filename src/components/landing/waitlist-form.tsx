"use client";

import { useActionState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { joinWaitlist, type WaitlistState } from "@/app/waitlist/actions";

const field =
  "peer block w-full border-0 border-b border-olive bg-transparent px-0 pb-2 pt-6 text-base text-jet-tint transition-colors placeholder:text-transparent focus:border-jet-tint focus:outline-none";
const floatLabel =
  "pointer-events-none absolute left-0 top-6 font-mono text-xs uppercase tracking-[0.16em] text-jet transition-all duration-200 peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0";

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
      <div role="status" className="flex items-start gap-4 border border-olive p-6 text-jet-tint">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate">
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
        <p role="alert" className="border-l-2 border-jet-tint pl-3 text-sm text-jet-tint">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center gap-3 border border-jet-tint bg-jet-tint px-6 py-3 text-sm font-medium text-jungle transition-colors hover:bg-jet disabled:cursor-wait disabled:bg-jet"
      >
        {pending ? "Joining…" : "Join the waitlist"}
        <ArrowRight size={16} strokeWidth={1.5} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </form>
  );
}
