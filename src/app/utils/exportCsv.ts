export interface CsvColumn<T = any> {
  key: string;
  label: string;
  accessor?: (row: T) => unknown;
}

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = typeof value === "string" ? value : String(value);
  const needsQuote = /[",\n\r]/.test(s);
  if (needsQuote) {
    s = s.replace(/"/g, '""');
    return `"${s}"`;
  }
  return s;
}

export function exportToCsv<T = any>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const v = c.accessor ? c.accessor(row) : (row as any)?.[c.key];
          return escapeCell(v);
        })
        .join(","),
    )
    .join("\n");
  const csv = `${header}\n${body}`;
  // Add UTF-8 BOM so Excel renders Arabic correctly
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
