import { Search, Bell, Settings, HelpCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-lg">ECOVISION</span>
          </div>

          <nav className="flex items-center gap-6">
            <button className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium">Overview</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">Drivers Reviews</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">Drivers</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">Routes</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">Fleet Map</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">Smart Alerts</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">Analytics</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">More</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
            />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full"></div>
        </div>
      </div>
    </header>
  );
}
