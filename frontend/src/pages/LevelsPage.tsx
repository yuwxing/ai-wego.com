import { Link } from 'react-router-dom'
import { Award, Crown, Star, Unlock, ArrowLeft } from 'lucide-react'

const levels = [
  { level: 'Lv.1', title: '初学者', xp: '0-500', unlocked: '基础功能', current: false },
  { level: 'Lv.2', title: '探索者', xp: '500-1,000', unlocked: '宠物系统', current: false },
  { level: 'Lv.3', title: '进阶者', xp: '1,000-3,000', unlocked: '竞赛参与 · AI高级功能', current: true },
  { level: 'Lv.4', title: '达人', xp: '3,000-6,000', unlocked: '创建竞赛 · 导师指导', current: false },
  { level: 'Lv.5', title: '大师', xp: '6,000-10,000', unlocked: '菁华项目 · 经济特权', current: false },
]

export default function LevelsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/weg" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> 返回经济总览
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">等级系统</h1>
            <p className="text-sm text-slate-500">升级规则 · 解锁能力 · 成长路径</p>
          </div>
        </div>
        <div className="space-y-3">
          {levels.map((l, i) => (
            <div key={i} className={`p-5 rounded-xl border transition-colors ${l.current ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {l.current ? <Crown className="w-6 h-6 text-amber-500" /> : <Star className="w-5 h-5 text-slate-300" />}
                  <div>
                    <span className="text-lg font-bold text-slate-800">{l.level}</span>
                    <span className="text-sm text-slate-500 ml-2">{l.title}</span>
                    {l.current && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">当前</span>}
                  </div>
                </div>
                <span className="text-sm text-slate-400">{l.xp} XP</span>
              </div>
              <div className="mt-2 ml-9 flex items-center gap-1 text-xs text-slate-500">
                <Unlock className="w-3 h-3" /> {l.unlocked}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
