import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, BookOpen, Mic, Target, Zap, ArrowLeft } from 'lucide-react'
import { xpAPI } from '../utils/supabase'

const ACTION_ICONS: Record<string, any> = {
  wordcard: { icon: BookOpen, color: 'text-sky-500', to: '/learn/word-cards' },
  listening: { icon: Mic, color: 'text-green-500', to: '/learn/listening-speaking' },
  daily_english: { icon: Target, color: 'text-teal-500', to: '/learn/english-daily' },
  streak: { icon: Zap, color: 'text-amber-500', to: '/weg/rewards' },
}

const formatTime = (ts: string) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小时前`;
  const days = Math.floor(hrs / 24);
  return `${days}天前`;
};

export default function XpPage() {
  const [totalXp, setTotalXp] = useState(0);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
        if (!userId) return;
        const [total, history] = await Promise.all([
          xpAPI.getTotal(userId),
          xpAPI.getHistory(userId),
        ]);
        setTotalXp(total);
        setRecords(history || []);
      } catch (e) {
        console.error('Failed to load XP data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const levelXp = (() => {
    if (totalXp >= 6000) return { current: 'Lv.5', title: '大师', next: null, progress: 100 };
    if (totalXp >= 3000) return { current: 'Lv.4', title: '达人', next: 6000, progress: (totalXp - 3000) / 3000 * 100 };
    if (totalXp >= 1000) return { current: 'Lv.3', title: '进阶者', next: 3000, progress: (totalXp - 1000) / 2000 * 100 };
    if (totalXp >= 500) return { current: 'Lv.2', title: '探索者', next: 1000, progress: (totalXp - 500) / 500 * 100 };
    return { current: 'Lv.1', title: '初学者', next: 500, progress: totalXp / 500 * 100 };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-sky-50 to-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/weg" className="text-sm text-slate-500 hover:text-green-600 mb-6 inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回经济总览
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              <span className="gradient-text-primary">XP系统</span>
            </h1>
            <p className="text-sm text-slate-500">成长来源 · 行为绑定</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/60 p-6 mb-6">
          {loading ? (
            <div className="text-center text-slate-400 py-4">加载中...</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-slate-800">
                  {levelXp.current} {levelXp.title}
                </span>
                <span className="text-2xl font-bold text-green-600">{totalXp.toLocaleString()} XP</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min(levelXp.progress, 100)}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {levelXp.next ? `${totalXp.toLocaleString()} / ${levelXp.next.toLocaleString()} 升级至下一级` : '已达最高等级'}
              </p>
            </>
          )}
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/60 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">获取记录</h2>
          {loading ? (
            <div className="text-center text-slate-400 py-4">加载中...</div>
          ) : records.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>还没有获取记录</p>
              <p className="text-xs mt-1">完成单词练习、听说训练等学习活动即可获得 XP</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((r: any, i: number) => {
                const xpType = r.type?.startsWith('xp_') ? r.type.slice(3) : '';
                const meta = ACTION_ICONS[xpType] || { icon: Zap, color: 'text-slate-400', to: '/weg' };
                const Icon = meta.icon;
                return (
                  <Link key={r.id || i} to={meta.to} className="flex items-center justify-between py-2 border-b border-green-50 last:border-0 hover:bg-green-50/50 px-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                      <span className="text-sm text-slate-700">{r.description || xpType}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-green-600">+{r.amount} XP</span>
                      <p className="text-xs text-slate-400">{formatTime(r.created_at)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}