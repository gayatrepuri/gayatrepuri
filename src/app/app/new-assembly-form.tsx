"use client";

import { useActionState } from "react";
import { Button, Input, Label, Notice } from "@/components/ui";
import { createAssembly, type CreateAssemblyState } from "./actions";

export function NewAssemblyForm() {
  const [state, action, pending] = useActionState<CreateAssemblyState, FormData>(createAssembly, {});
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="name">New assembly name</Label>
        <Input id="name" name="name" placeholder="e.g. Conveyor drive unit CD-400" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create assembly"}
      </Button>
      {state.error && (
        <div className="sm:basis-full">
          <Notice tone="error">{state.error}</Notice>
        </div>
      )}
    </form>
  );
}
