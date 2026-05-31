import { X, Settings, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  remaining: number;
  onClose: () => void;
}

export default function FreeUsageModal({ remaining, onClose }: Props) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {remaining > 0 ? `还剩 ${remaining} 次免费体验` : '免费次数已用完'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          {remaining > 0
            ? '智能体聊天、群聊等功能需要消耗免费体验次数。'
            : '所有付费功能的免费体验次数已用完。你可以配置自己的 DeepSeek API Key 继续使用。'}
        </p>
        <div className="space-y-3">
          {remaining > 0 && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-400 hover:to-pink-400 transition-all"
            >
              继续使用（剩余 {remaining} 次）
            </button>
          )}
          <button
            onClick={() => { navigate('/settings'); onClose(); }}
            className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-600 font-medium hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" /> 去系统中心配置 API Key
          </button>
          {remaining <= 0 && (
            <p className="text-xs text-slate-400 text-center">
              配置你自己的 DeepSeek Key 后即可无限使用所有功能
            </p>
          )}
        </div>
      </div>
    </div>
  );
}