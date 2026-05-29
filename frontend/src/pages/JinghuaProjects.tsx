import { Link } from 'react-router-dom'
import { FlaskConical, Target, ListTodo, ArrowRight } from 'lucide-react'

export default function JinghuaProjects() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/jinghua" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">&larr; 返回菁华大学</Link>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">科研系统</h1>
        <p className="text-slate-500 mb-8">高阶研究项目 · AI科研辅助 · 任务分解</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
            <FlaskConical className="w-8 h-8 text-violet-500 mb-3" />
            <h2 className="font-semibold text-slate-800">项目列表</h2>
            <p className="text-sm text-slate-500 mt-1">浏览和参与科研项目</p>
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
            <Target className="w-8 h-8 text-violet-500 mb-3" />
            <h2 className="font-semibold text-slate-800">AI科研辅助</h2>
            <p className="text-sm text-slate-500 mt-1">AI驱动的科研工具和资源</p>
            <p className="mt-3 text-sm text-slate-400">即将推出 <ArrowRight className="w-3 h-3 inline" /></p>
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
            <ListTodo className="w-8 h-8 text-violet-500 mb-3" />
            <h2 className="font-semibold text-slate-800">任务分解</h2>
            <p className="text-sm text-slate-500 mt-1">将大项目分解为可执行任务</p>
            <p className="mt-3 text-sm text-slate-400">即将推出 <ArrowRight className="w-3 h-3 inline" /></p>
          </div>
        </div>
      </div>
    </div>
  )
}
