import { Link } from 'react-router-dom'
import { TrendingUp, BookOpen, Mic, Target, Zap, ArrowLeft } from 'lucide-react'

const records = [
  { action: '完成单词练习', xp: '+10 XP', time: '10分钟前', icon: BookOpen, color: 'text-blue-500', to: '/learn/word-cards' },
  { action: '听说训练评分A', xp: '+20 XP', time: '1小时前', icon: Mic, color: 'text-green-500', to: '/learn/listening-speaking' },
  { action: '完成每日英语', xp: '+15 XP', time: '2小时前', icon: Target, color: 'text-purple-500', to: '/learn/english-daily' },
  { action: '连续签到3天', xp: '+30 XP', time: '昨天', icon: Zap, color: 'text-amber-500', to: '/weg/rewards' },
]

export default function XpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/weg" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> 返回经济总览
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">XP系统</h1>
            <p className="text-sm text-slate-500">成长来源 · 行为绑定</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-slate-800">总XP</span>
            <span className="text-2xl font-bold text-emerald-600">1,280</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '42%' }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">1,280 / 3,000 升级至 Lv.4</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">获取记录</h2>
          <div className="space-y-4">
            {records.map((r, i) => (
              <Link key={i} to={r.to} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <r.icon className={`w-5 h-5 ${r.color}`} />
                  <span className="text-sm text-slate-700">{r.action}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-emerald-600">{r.xp}</span>
                  <p className="text-xs text-slate-400">{r.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
