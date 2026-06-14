import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'cyan' | 'purple' | 'orange' | 'green' | 'blue';
  details?: { label: string; value: string; color: string }[];
  showProgress?: boolean;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color = 'cyan',
  details,
  showProgress
}: MetricCardProps) {
  const colorClasses = {
    cyan: 'from-cyan-400 to-cyan-500',
    purple: 'from-purple-400 to-purple-500',
    orange: 'from-orange-400 to-orange-500',
    green: 'from-green-400 to-green-500',
    blue: 'from-blue-400 to-blue-500',
  };

  return (
    <div className="bg-white dark:bg-slate-900/70 dark:backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 text-foreground">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-sm`}>
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="text-xs font-medium text-gray-500 dark:text-slate-400">{title}</div>
      </div>

      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-900 dark:text-slate-50">{value}</div>
        {subtitle && <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">{subtitle}</div>}
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? (
            <ArrowUpRight className="w-4 h-4 text-green-500 dark:text-emerald-400" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500 dark:text-rose-400" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500 dark:text-emerald-400' : 'text-red-500 dark:text-rose-400'}`}>
            {trendValue}
          </span>
          <span className="text-sm text-gray-500 dark:text-slate-400">vs last week</span>
        </div>
      )}

      {showProgress && (
        <div className="mt-4">
          <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full w-3/4 bg-gradient-to-r ${colorClasses[color]} rounded-full`}></div>
          </div>
        </div>
      )}

      {details && (
        <div className="mt-4 space-y-2">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${detail.color}`}></div>
                <span className="text-xs text-gray-600 dark:text-slate-300">{detail.label}</span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-slate-100">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
