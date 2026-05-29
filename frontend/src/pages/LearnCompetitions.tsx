import { Link } from 'react-router-dom'
import { BookOpen, Target, Route, ArrowRight } from 'lucide-react'

export default function LearnCompetitions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/learn" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">&larr; 返回学习系统</Link>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">竞赛入口</h1>
        <p className="text-slate-500 mb-8">教育部白名单竞赛 · 以赛促学 · 以学备考</p>
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
            <BookOpen className="w-8 h-8 text-rose-500 mb-3" />
            <h2 className="font-semibold text-slate-800">白名单竞赛</h2>
            <p className="text-sm text-slate-500 mt-1">教育部认证竞赛列表</p>
            <Link to="/competitions" className="inline-flex items-center gap-1 mt-3 text-sm text-rose-600 hover:underline">
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
            <Target className="w-8 h-8 text-rose-500 mb-3" />
            <h2 className="font-semibold text-slate-800">竞赛推荐</h2>
            <p className="text-sm text-slate-500 mt-1">基于你的学习进度推荐</p>
            <p className="mt-3 text-sm text-slate-400">完成更多学习任务获取推荐</p>
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
            <Route className="w-8 h-8 text-rose-500 mb-3" />
            <h2 className="font-semibold text-slate-800">学习路径</h2>
            <p className="text-sm text-slate-500 mt-1">从基础到竞赛的进阶路线</p>
            <p className="mt-3 text-sm text-slate-400">即将推出</p>
          </div>
        </div>
        <div className="p-6 bg-rose-50 rounded-xl border border-rose-200">
          <h3 className="font-semibold text-rose-800">热门竞赛</h3>
          <p className="text-sm text-rose-600 mt-1">查看进行中的竞赛活动</p>
          <Link to="/competitions" className="inline-block mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 transition-colors">前往竞赛广场</Link>
        </div>
      </div>
    </div>
  )
}
