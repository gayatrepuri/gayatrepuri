"use client";

import { useActionState, useState } from "react";
import { Button, Input, Label, Notice } from "@/components/ui";
import { signIn, signUp, type AuthState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signingIn] = useActionState<AuthState, FormData>(signIn, {});
  const [signUpState, signUpAction, signingUp] = useActionState<AuthState, FormData>(signUp, {});
  const state = mode === "signin" ? signInState : signUpState;
  const pending = signingIn || signingUp;

  return (
    <form action={mode === "signin" ? signInAction : signUpAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          minLength={mode === "signup" ? 8 : undefined}
          required
        />
      </div>

      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.message && <Notice>{state.message}</Notice>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </Button>

      <p className="text-sm text-granite">
        {mode === "signin" ? "No account yet? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="font-medium text-jungle underline underline-offset-4"
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
