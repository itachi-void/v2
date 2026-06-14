import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from 'next-themes';

const data = [
  { name: '8am', value1: 30, value2: 45, value3: 35, value4: 50 },
  { name: '10am', value1: 45, value2: 55, value3: 48, value4: 60 },
  { name: '12pm', value1: 55, value2: 65, value3: 58, value4: 70 },
  { name: '2pm', value1: 50, value2: 60, value3: 52, value4: 65 },
  { name: '4pm', value1: 60, value2: 70, value3: 62, value4: 75 },
  { name: '6pm', value1: 48, value2: 58, value3: 50, value4: 63 },
  { name: '8pm', value1: 40, value2: 50, value3: 42, value4: 55 },
];

export default function OperationsConsole() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const axisStroke = isDark ? 'rgba(226,232,240,0.55)' : '#888';

  return (
    <div className="bg-white dark:bg-slate-900/70 dark:backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 text-foreground">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">OPERATIONS CONSOLE</h3>
        <div className="flex items-center gap-4">
          <button className="text-xs text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100">Daily</button>
          <button className="text-xs text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100">Weekly</button>
          <button className="text-xs text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100">Monthly</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">TOTAL TRIPS</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-50">4.746kg</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">TOTAL MASS</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-50">670kg</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">TOTAL DELIVERY</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-50">Thursday</div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisStroke }} stroke={axisStroke} />
            <YAxis tick={{ fontSize: 12, fill: axisStroke }} stroke={axisStroke} />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: axisStroke }}
            />
            <Line
              type="monotone"
              dataKey="value1"
              stroke={isDark ? '#a78bfa' : '#8b5cf6'}
              strokeWidth={2}
              dot={false}
              name="Series 1"
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke={isDark ? '#60a5fa' : '#3b82f6'}
              strokeWidth={2}
              dot={false}
              name="Series 2"
            />
            <Line
              type="monotone"
              dataKey="value3"
              stroke={isDark ? '#fbbf24' : '#f59e0b'}
              strokeWidth={2}
              dot={false}
              name="Series 3"
            />
            <Line
              type="monotone"
              dataKey="value4"
              stroke={isDark ? '#34d399' : '#10b981'}
              strokeWidth={2}
              dot={false}
              name="Series 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
