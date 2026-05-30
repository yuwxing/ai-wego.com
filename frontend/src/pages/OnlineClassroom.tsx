import { ArrowLeft, ExternalLink, Maximize2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function OnlineClassroom() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
        <button
          onClick={() => navigate('/learn')}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回学习系统</span>
        </button>

        <h1 className="text-white font-semibold text-lg">在线教室</h1>

        <a
          href="https://open.maic.chat/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>新窗口打开</span>
        </a>
      </header>

      <div className="flex-1">
        <iframe
          src="https://open.maic.chat/"
          className="w-full h-full border-0"
          title="OpenMAIC 在线教室"
          allow="microphone; camera; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  )
}
