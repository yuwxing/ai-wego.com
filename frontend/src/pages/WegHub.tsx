import { Link } from 'react-router-dom'
import { TrendingUp, Award, Wallet, Gift, Zap } from 'lucide-react'

const sections = [
  { to: '/weg/xp', icon: TrendingUp, title: 'XP系统', desc: '获取记录 · 成长来源 · 行为绑定', color: 'bg-emerald-500', value: '1,280 XP' },
  { to: '/weg/levels', icon: Award, title: '等级系统', desc: '升级规则 · 解锁能力 · 成长路径', color: 'bg-amber-500', value: 'Lv.3 进阶者' },
  { to: '/weg/balance', icon: Wallet, title: '余额系统', desc: '收入记录 · 消耗记录', color: 'bg-blue-500', value: '128 WEG' },
  { to: '/weg/rewards', icon: Gift, title: '奖励中心', desc: '兑换列表 · 权益解锁 · 成长奖励', color: 'bg-rose-500', value: '3 未领取' },
]

export default function WegHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm mb-4">
            <Zap className="w-4 h-4" /> WEG成长经济系统
          </div>
          <h1 className="text-3xl font-bold text-slate-800">经济总览</h1>
          <p className="text-slate-500 mt-1">你的成长，每一步都有回报</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map(s => (
            <Link key={s.to} to={s.to} className="group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 ${s.color} rounded-lg flex items-center justify-center mb-4`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">{s.value}</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">{s.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
