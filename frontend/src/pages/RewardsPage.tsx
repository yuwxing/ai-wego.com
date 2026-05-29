import { Link } from 'react-router-dom'
import { Gift, CheckCircle, Clock, ArrowLeft, Sparkles } from 'lucide-react'

const rewards = [
  { title: '连续签到7天', desc: '额外 +50 XP 奖励', claimed: false, days: '5/7' },
  { title: '完成10次听说训练', desc: '解锁 AI 评分高级模式', claimed: false, days: '3/10' },
  { title: '积累5天学习 streak', desc: '宠物精灵装扮 ×1', claimed: true, days: '已完成' },
]

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/weg" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> 返回经济总览
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">奖励中心</h1>
            <p className="text-sm text-slate-500">兑换列表 · 权益解锁 · 成长奖励</p>
          </div>
        </div>
        <div className="grid gap-3">
          {rewards.map((r, i) => (
            <div key={i} className={`p-5 rounded-xl border ${r.claimed ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {r.claimed ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" /> : <Sparkles className="w-5 h-5 text-rose-500 mt-0.5" />}
                  <div>
                    <h3 className={`font-semibold ${r.claimed ? 'text-slate-400' : 'text-slate-800'}`}>{r.title}</h3>
                    <p className="text-sm text-slate-500">{r.desc}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${r.claimed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {r.claimed ? '已领取' : r.days}
                </span>
              </div>
              {!r.claimed && (
                <button className="mt-3 ml-8 px-3 py-1.5 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50" disabled>
                  <Clock className="w-3.5 h-3.5 inline mr-1" />进行中
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
