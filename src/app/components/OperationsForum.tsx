import { ChevronRight, Circle } from 'lucide-react';

const tasks = [
  { id: 1, title: 'John Doe', status: 'active', distance: '120 km' },
  { id: 2, title: 'Sarah A.', status: 'pending', distance: '85 km' },
  { id: 3, title: 'Mike Lynch', status: 'completed', distance: '200 km' },
  { id: 4, title: 'Ali Ahmed', status: 'active', distance: '150 km' },
];

export default function OperationsForum() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-900">OPERATIONS FORUM</h3>
        <button className="text-xs text-cyan-500 hover:text-cyan-600 font-medium flex items-center gap-1">
          VIEW ALL
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                {task.title.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-medium text-sm">{task.title}</div>
                <div className="text-xs text-gray-500">{task.distance}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Circle
                className={`w-2 h-2 ${
                  task.status === 'active' ? 'fill-green-500 text-green-500' :
                  task.status === 'pending' ? 'fill-orange-500 text-orange-500' :
                  'fill-gray-400 text-gray-400'
                }`}
              />
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
