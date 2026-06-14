export default function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-2xl bg-gradient-to-br from-slate-100/70 to-slate-200/40 dark:from-white/[0.04] dark:to-white/[0.02] border border-slate-200/60 dark:border-white/5 animate-pulse flex items-end gap-2 px-4 pb-4 pt-8"
      style={{ height }}
    >
      {[42, 58, 36, 70, 50, 64, 48, 78].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-lg bg-slate-300/60 dark:bg-white/10"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
