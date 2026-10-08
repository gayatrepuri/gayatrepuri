"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label, Notice } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { addDrawing, deleteDrawing, setDrawingPart } from "./actions";

export type DrawingRow = {
  id: string;
  fileName: string;
  partId: string | null;
  sizeBytes: number | null;
  url: string | null;
};

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp";
const MAX_BYTES = 20 * 1024 * 1024;

const formatSize = (b: number | null) => (b === null ? "" : b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

export function DrawingsPanel({
  assemblyId,
  userId,
  drawings,
  parts,
}: {
  assemblyId: string;
  userId: string;
  drawings: DrawingRow[];
  parts: { id: string; part_number: string; description: string | null }[];
}) {
  const router = useRouter();
  const [attachTo, setAttachTo] = useState<string>("");
  const [status, setStatus] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [busy, startBusy] = useTransition();

  function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const tooBig = list.find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      setStatus({ tone: "error", text: `${tooBig.name} is larger than 20 MB. Please reduce it (e.g. export the PDF at lower resolution).` });
      return;
    }
    setStatus({ tone: "info", text: `Uploading ${list.length} file${list.length > 1 ? "s" : ""}…` });

    startBusy(async () => {
      const supabase = createClient();
      for (const file of list) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-120);
        const path = `${userId}/${assemblyId}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("drawings").upload(path, file, { contentType: file.type });
        if (uploadError) {
          setStatus({ tone: "error", text: `${file.name}: ${uploadError.message}` });
          return;
        }
        const result = await addDrawing(assemblyId, {
          storagePath: path,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          partId: attachTo || null,
        });
        if (result.error) {
          setStatus({ tone: "error", text: `${file.name}: ${result.error}` });
          return;
        }
      }
      setStatus({ tone: "info", text: "Upload complete." });
      router.refresh();
    });
  }

  function changePart(fileId: string, partId: string) {
    startBusy(async () => {
      const r = await setDrawingPart(assemblyId, fileId, partId || null);
      if (r.error) setStatus({ tone: "error", text: r.error });
      router.refresh();
    });
  }

  function remove(d: DrawingRow) {
    if (!window.confirm(`Delete ${d.fileName}?`)) return;
    startBusy(async () => {
      const r = await deleteDrawing(assemblyId, d.id);
      if (r.error) setStatus({ tone: "error", text: r.error });
      router.refresh();
    });
  }

  const select = "mt-1 block w-full rounded-sm border border-granite bg-jet-tint px-2 py-2 text-sm text-jungle";
  const partOptions = parts.map((p) => (
    <option key={p.id} value={p.id}>
      {p.part_number}
      {p.description ? `: ${p.description.slice(0, 50)}` : ""}
    </option>
  ));

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Upload drawings</h2>
        <p className="text-sm text-granite">PDF or image (PNG, JPG, WebP), up to 20 MB each. Drawings are private to your account.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="attach-to">Attach to</Label>
            <select id="attach-to" className={select} value={attachTo} onChange={(e) => setAttachTo(e.target.value)}>
              <option value="">The whole assembly</option>
              {partOptions}
            </select>
          </div>
          <div>
            <Label htmlFor="drawing-files">Files</Label>
            <input
              id="drawing-files"
              type="file"
              multiple
              accept={ACCEPT}
              disabled={busy}
              onChange={(e) => {
                upload(e.target.files);
                e.target.value = "";
              }}
              className="mt-1 block text-sm file:mr-4 file:rounded-sm file:border file:border-jungle file:bg-jungle file:px-4 file:py-2 file:text-sm file:font-medium file:text-jet-tint"
            />
          </div>
        </div>
        {status && <Notice tone={status.tone}>{status.text}</Notice>}
      </section>

      <section>
        <h2 className="text-lg font-medium">Drawings</h2>
        {drawings.length === 0 ? (
          <p className="mt-3 border-y border-jet py-6 text-sm text-granite">No drawings yet.</p>
        ) : (
          <table className="mt-3 w-full border-y border-jet text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-granite">
              <tr className="border-b border-jet">
                <th className="px-2 py-2 font-medium">File</th>
                <th className="w-80 px-2 py-2 font-medium">Attached to</th>
                <th className="w-24 px-2 py-2 text-right font-medium">Size</th>
                <th className="w-20 px-2 py-2">
                  <span className="sr-only">Delete</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jet">
              {drawings.map((d) => (
                <tr key={d.id}>
                  <td className="px-2 py-2">
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                        {d.fileName}
                      </a>
                    ) : (
                      d.fileName
                    )}
                  </td>
                  <td className="px-2 py-1">
                    <select aria-label={`Attach ${d.fileName} to`} className={select} value={d.partId ?? ""} disabled={busy} onChange={(e) => changePart(d.id, e.target.value)}>
                      <option value="">The whole assembly</option>
                      {partOptions}
                    </select>
                  </td>
                  <td className="num px-2 py-2 text-right text-granite">{formatSize(d.sizeBytes)}</td>
                  <td className="px-2 py-2 text-right">
                    <button type="button" onClick={() => remove(d)} disabled={busy} className="text-sm underline underline-offset-4">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
