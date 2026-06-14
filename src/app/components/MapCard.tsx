import imageMap from "../../imports/image.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Navigation } from 'lucide-react';

export default function MapCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-700">LIVE ROUTE VIEW</span>
        </div>
        <button className="text-xs text-cyan-500 hover:text-cyan-600 font-medium">
          FULL MAP
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden">
        <ImageWithFallback
          src={imageMap}
          alt="Live route map view"
          className="w-full h-48 object-cover"
        />
      </div>
    </div>
  );
}
