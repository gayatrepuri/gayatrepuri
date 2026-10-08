// File readers. Each reader turns an uploaded file into a table of cells.
// They run in the browser, so files are read on the user's computer before anything is saved.
//
// Adding a new format later (e.g. a STEP file reader that extracts the part list from a CAD model)
// means adding one more entry to READERS. Nothing else needs to change.

import type { Table } from "@/lib/bom/mapping";

export type ReadResult = { sheets: { name: string; table: Table }[] };

export type FileReaderPlugin = {
  label: string;
  extensions: string[];
  read: (file: File) => Promise<ReadResult>;
};

const csvReader: FileReaderPlugin = {
  label: "CSV",
  extensions: [".csv", ".txt", ".tsv"],
  async read(file) {
    const Papa = (await import("papaparse")).default;
    const text = await file.text();
    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false });
    return { sheets: [{ name: file.name, table: parsed.data }] };
  },
};

const excelReader: FileReaderPlugin = {
  label: "Excel",
  extensions: [".xlsx"],
  async read(file) {
    const { default: readXlsxFile } = await import("read-excel-file/browser");
    const sheets = await readXlsxFile(file);
    return { sheets: sheets.map((s) => ({ name: s.sheet, table: s.data as Table })) };
  },
};

export const READERS: FileReaderPlugin[] = [csvReader, excelReader];

export const ACCEPTED_EXTENSIONS = READERS.flatMap((r) => r.extensions).join(",");

export function readerFor(fileName: string): FileReaderPlugin | undefined {
  const lower = fileName.toLowerCase();
  return READERS.find((r) => r.extensions.some((ext) => lower.endsWith(ext)));
}
