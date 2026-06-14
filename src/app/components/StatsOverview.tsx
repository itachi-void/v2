import { ChevronDown } from 'lucide-react';

export default function StatsOverview() {
  return (
    <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 rounded-2xl p-5 shadow-lg text-white">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-full"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide">CREATORA ECOVISION</h3>
            <p className="text-xs opacity-80">ACTIVE SYSTEM CONSOLE</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-80">Active Requests</span>
            <span className="text-lg font-bold">4</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-80">Route Drivers</span>
            <span className="text-lg font-bold">3</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-80">Avg Dispatch</span>
            <span className="text-lg font-bold">14m</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-80">CO₂ Saved</span>
            <span className="text-lg font-bold">2,340 kg</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs">
            MONTH
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-lg">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium">LIVE VIEW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
