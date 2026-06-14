const base =
  "animate-pulse bg-gradient-to-r from-slate-200/70 via-slate-100/40 to-slate-200/70 dark:from-white/[0.06] dark:via-white/[0.10] dark:to-white/[0.06]";

const glass =
  "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl";

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`${glass} p-5 ${className}`}>
      <div className={`w-12 h-12 rounded-2xl ${base} mb-3`} />
      <div className={`h-3 w-24 rounded-full ${base} mb-2`} />
      <div className={`h-6 w-32 rounded-full ${base}`} />
    </div>
  );
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] ${className}`}
    >
      <div className={`w-10 h-10 rounded-xl ${base}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-3 w-1/3 rounded-full ${base}`} />
        <div className={`h-3 w-2/3 rounded-full ${base}`} />
      </div>
      <div className={`h-3 w-16 rounded-full ${base}`} />
    </div>
  );
}

export function SkeletonChart({ className = "" }: { className?: string }) {
  return (
    <div className={`${glass} p-6 ${className}`}>
      <div className={`h-4 w-40 rounded-full ${base} mb-2`} />
      <div className={`h-3 w-60 rounded-full ${base} mb-5`} />
      <div className={`h-[260px] w-full rounded-2xl ${base}`} />
    </div>
  );
}

export default { SkeletonCard, SkeletonRow, SkeletonChart };
