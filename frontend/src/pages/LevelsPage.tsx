import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Crown, Star, Unlock, ArrowLeft } from 'lucide-react'
import { xpAPI } from '../utils/supabase'

const LEVELS = [
  { level: 'Lv.1', title: '初学者', minXp: 0, maxXp: 499, unlocked: '基础功能' },
  { level: 'Lv.2', title: '探索者', minXp: 500, maxXp: 999, unlocked: '宠物系统' },
  { level: 'Lv.3', title: '进阶者', minXp: 1000, maxXp: 2999, unlocked: '竞赛参与 · AI高级功能' },
  { level: 'Lv.4', title: '达人', minXp: 3000, maxXp: 5999, unlocked: '创建竞赛 · 导师指导' },
  { level: 'Lv.5', title: '大师', minXp: 6000, maxXp: Infinity, unlocked: '菁华项目 · 经济特权' },
];

function calcLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return i;
  }
  return 0;
}

export default function LevelsPage() {
  const [totalXp, setTotalXp] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
        if (userId) setTotalXp(await xpAPI.getTotal(userId));
      } catch (_) {}
    })();
  }, []);

  const currentIdx = totalXp !== null ? calcLevel(totalXp) : -1;

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
        {totalXp !== null && (
          <div className="mb-4 px-5 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-slate-600">
            当前 XP：<span className="font-bold text-amber-700">{totalXp.toLocaleString()}</span>
            {currentIdx < LEVELS.length - 1 && (
              <span className="ml-2">
                · 距离 {LEVELS[currentIdx + 1].level} {LEVELS[currentIdx + 1].title} 还需
                <span className="font-bold text-amber-700"> {(LEVELS[currentIdx + 1].minXp - totalXp).toLocaleString()} XP</span>
              </span>
            )}
          </div>
        )}
        <div className="space-y-3">
          {LEVELS.map((l, i) => {
            const isCurrent = i === currentIdx;
            const isUnlocked = totalXp !== null && totalXp >= l.minXp;
            return (
              <div key={i} className={`p-5 rounded-xl border transition-colors ${isCurrent ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCurrent ? <Crown className="w-6 h-6 text-amber-500" /> : <Star className={`w-5 h-5 ${isUnlocked ? 'text-amber-400' : 'text-slate-300'}`} />}
                    <div>
                      <span className="text-lg font-bold text-slate-800">{l.level}</span>
                      <span className="text-sm text-slate-500 ml-2">{l.title}</span>
                      {isCurrent && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">当前</span>}
                      {isUnlocked && !isCurrent && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">已解锁</span>}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">{l.maxXp === Infinity ? `${l.minXp.toLocaleString()}+` : `${l.minXp.toLocaleString()} - ${l.maxXp.toLocaleString()}`} XP</span>
                </div>
                <div className="mt-2 ml-9 flex items-center gap-1 text-xs text-slate-500">
                  <Unlock className="w-3 h-3" /> {l.unlocked}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}