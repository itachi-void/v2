import { Phone, MessageCircle } from 'lucide-react';

export default function UserCard() {
  return (
    <div className="bg-white dark:bg-slate-900/70 dark:backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 text-foreground">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">EMPLOYEE • 0001-334</span>
        <span className="px-2 py-1 bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300 text-xs font-medium rounded">ACTIVE</span>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-slate-50">JOHN DOE</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">California, USA</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-50">12.0</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Trips Completed</div>
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-50">45</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Total KM</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 dark:text-slate-400">TOTAL PROGRESS</span>
          <span className="text-xs font-medium text-gray-900 dark:text-slate-100">75%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">LOCATION</div>
          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">California</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">AVAILABLE</div>
          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">24/7</div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 dark:bg-cyan-500/90 dark:hover:bg-cyan-400">
          <Phone className="w-4 h-4" />
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 rounded-lg">
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
