import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Trash2, MessageCircle, Clock } from 'lucide-react';

interface Note {
  id: number;
  content: string;
  source: string;
  timestamp: string;
}

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('chat_notes') || '[]');
    setNotes(data);
  }, []);

  const deleteNote = (id: number) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('chat_notes', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotes([]);
    localStorage.removeItem('chat_notes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pb-12">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">我的笔记</h1>
              <p className="text-sm text-slate-500">对话中保存的精彩语录</p>
            </div>
          </div>
          {notes.length > 0 && (
            <button onClick={clearAll} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs hover:bg-slate-50 transition-colors flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> 清空
            </button>
          )}
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无保存的笔记</p>
            <p className="text-slate-400 text-sm mt-1">在导师对话中点击"保存"收藏精彩内容</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> {note.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {note.timestamp}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
