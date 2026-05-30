import { Link } from 'react-router-dom'
import { BookOpen, Headphones, Newspaper, Bot, Monitor } from 'lucide-react'

const tools = [
  { to: '/learn/word-cards', icon: BookOpen, title: '单词系统', desc: '单词卡片 · 记忆训练 · 测试模式', color: 'bg-blue-500' },
  { to: '/learn/listening-speaking', icon: Headphones, title: '听说训练', desc: '模仿朗读 · 听选信息 · 回答问题 · 信息转述 · AI评分', color: 'bg-green-500' },
  { to: '/learn/english-daily', icon: Newspaper, title: '每日英语', desc: '阅读理解 · 语法训练 · 写作训练 · AI批改', color: 'bg-purple-500' },
  { to: '/learn/online-classroom', icon: Monitor, title: '在线教室', desc: 'AI智能备课 · 互动授课 · OpenMAIC 课堂', color: 'bg-red-500' },
  { to: '/learn/classroom', icon: Bot, title: 'AI学习助手', desc: 'AI智能辅导 · 宠物精灵陪伴 · 互动聊天', color: 'bg-orange-500' },
]

export default function LearnHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">学习系统</h1>
        <p className="text-slate-500 mb-8">初中核心学习系统 · 从基础到中考全覆盖</p>
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map(t => (
            <Link key={t.to} to={t.to} className="group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className={`w-12 h-12 ${t.color} rounded-lg flex items-center justify-center mb-4`}>
                <t.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{t.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
