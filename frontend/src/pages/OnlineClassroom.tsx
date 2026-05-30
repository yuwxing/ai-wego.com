import { ArrowLeft, ExternalLink, GraduationCap, Sparkles, BookOpen, Bot, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function OnlineClassroom() {
  const navigate = useNavigate()

  const openClassroom = () => {
    window.open('https://open.maic.chat/', '_blank', 'noopener')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700 shrink-0">
        <button
          onClick={() => navigate('/learn')}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回学习系统</span>
        </button>
        <h1 className="text-white font-semibold text-lg">在线教室</h1>
        <div className="w-24" />
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">OpenMAIC 在线教室</h2>
          <p className="text-slate-400 mb-8 text-lg">
            清华大学开源的多智能体 AI 互动课堂平台
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: BookOpen, label: '自动生成课件', color: 'from-blue-500 to-cyan-500' },
              { icon: Bot, label: 'AI 教师授课', color: 'from-purple-500 to-pink-500' },
              { icon: MessageSquare, label: '课堂实时互动', color: 'from-green-500 to-emerald-500' },
              { icon: Sparkles, label: '随堂测验', color: 'from-amber-500 to-orange-500' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <button
              onClick={openClassroom}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-lg font-bold rounded-2xl hover:from-red-400 hover:to-orange-400 transition-all shadow-xl shadow-red-500/30 hover:shadow-2xl hover:-translate-y-0.5"
            >
              <GraduationCap className="w-6 h-6" />
              进入教室
              <ExternalLink className="w-5 h-5" />
            </button>
            <p className="text-sm text-slate-500">
              点击后将在新标签页打开 open.maic.chat · 输入课题即可生成课程
            </p>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
            <h3 className="text-white font-semibold mb-3">使用步骤</h3>
            <ol className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>点击上方"进入教室"按钮，打开 OpenMAIC</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>输入你想教授的课题（如"初中物理欧姆定律"）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>等待 15-30 分钟，AI 自动生成完整课程（课件 + 测验 + 互动实验）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                <span>开始上课！AI 老师授课，学生可随时提问互动</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
