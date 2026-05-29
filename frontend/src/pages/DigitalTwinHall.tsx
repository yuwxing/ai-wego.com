import { Link } from 'react-router-dom'
import { Plus, Bot, Users } from 'lucide-react'

export default function DigitalTwinHall() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">数字分身系统</h1>
            <p className="text-slate-500 mt-1">创建和管理你的AI数字分身</p>
          </div>
          <Link to="/digital-twins/create" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-5 h-5" />
            创建分身
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">分身大厅</h2>
            <p className="text-sm text-slate-500 mt-1">浏览所有可用AI分身</p>
            <Link to="/digital-twins" className="inline-block mt-3 text-sm text-indigo-600 hover:underline">进入大厅 →</Link>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">我的分身</h2>
            <p className="text-sm text-slate-500 mt-1">管理你创建或拥有的AI分身</p>
            <Link to="/digital-twins" className="inline-block mt-3 text-sm text-indigo-600 hover:underline">查看分身 →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
