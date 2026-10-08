"use client";

import { useState, useTransition } from "react";
import { Button, Input, Notice } from "@/components/ui";
import { deleteAssembly, renameAssembly } from "./actions";

export function AssemblyHeader({ id, name, isDemo }: { id: string; name: string; isDemo: boolean }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            className="flex max-w-xl gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              startBusy(async () => {
                const r = await renameAssembly(id, value);
                if (r.error) setError(r.error);
                else setEditing(false);
              });
            }}
          >
            <Input aria-label="Assembly name" value={value} onChange={(e) => setValue(e.target.value)} className="mt-0" autoFocus />
            <Button type="submit" disabled={busy}>
              Save
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <h1 className="text-2xl font-medium">
            {name}
            {isDemo && <span className="ml-3 align-middle text-xs uppercase tracking-wider text-granite">Demo data</span>}
          </h1>
        )}
        {error && <Notice tone="error">{error}</Notice>}
      </div>
      {!editing && (
        <div className="flex gap-4 text-sm">
          <button type="button" onClick={() => setEditing(true)} className="underline underline-offset-4">
            Rename
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (window.confirm(`Delete "${name}" with all its parts and drawings? This can't be undone.`)) {
                startBusy(async () => {
                  const r = await deleteAssembly(id);
                  if (r?.error) setError(r.error);
                });
              }
            }}
            className="underline underline-offset-4"
          >
            Delete assembly
          </button>
        </div>
      )}
    </div>
  );
}
