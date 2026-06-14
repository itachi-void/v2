import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Settings2, Inbox } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  hidden?: boolean;
  accessor?: (row: T) => any;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  initialPageSize?: number;
  emptyContent?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>(props: DataTableProps<T>) {
  const { data, columns, rowKey, initialPageSize = 10, emptyContent, onRowClick } = props;
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [page, setPage] = useState<number>(0);
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.hidden).map((c) => c.key)),
  );
  const [cogOpen, setCogOpen] = useState(false);
  const cogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (cogRef.current && !cogRef.current.contains(e.target as Node)) setCogOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const visibleCols = columns.filter((c) => !hidden.has(c.key));

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    const get = (r: T): any => (col.accessor ? col.accessor(r) : (r as any)[col.key]);
    const arr = [...data].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return -1;
      if (vb == null) return 1;
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      return String(va).localeCompare(String(vb), undefined, { numeric: true });
    });
    return sortDir === "asc" ? arr : arr.reverse();
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * pageSize;
  const pageRows = sorted.slice(pageStart, pageStart + pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleHidden = (key: string) => {
    setHidden((p) => {
      const n = new Set(p);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  };

  return (
    <div className="bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {sorted.length} {sorted.length === 1 ? "row" : "rows"}
        </p>
        <div className="relative" ref={cogRef}>
          <button
            onClick={() => setCogOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Columns
          </button>
          {cogOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0d1218] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-2 z-20">
              {columns.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={!hidden.has(c.key)}
                    onChange={() => toggleHidden(c.key)}
                    className="accent-emerald-600"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
              {visibleCols.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 ${c.sortable ? "cursor-pointer select-none" : ""} ${c.className || ""}`}
                  onClick={() => c.sortable && toggleSort(c.key)}
                >
                  <span className="inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
                    {c.label}
                    {c.sortable && sortKey === c.key && (
                      sortDir === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length} className="py-16">
                  {emptyContent ?? (
                    <div className="text-center">
                      <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">No data</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {visibleCols.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-slate-700 dark:text-slate-200 ${c.className || ""}`}>
                      {c.render ? c.render(row) : ((row as any)[c.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="h-8 px-2 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
