import { useParams, Link } from 'react-router-dom'
import { Upload, FileText, ArrowLeft } from 'lucide-react'

export default function SubmitPage() {
  const { id } = useParams()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to={`/competitions/${id}`} className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> 返回竞赛详情
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">作品提交</h1>
              <p className="text-sm text-slate-500">竞赛 #{id}</p>
            </div>
          </div>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">点击上传作品文件</p>
            <p className="text-sm text-slate-400 mt-1">支持 PDF, Word, 图片, 视频等格式</p>
          </div>
          <button className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">提交作品</button>
        </div>
      </div>
    </div>
  )
}
