import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, Loader2, Users, Check, X } from 'lucide-react';
import { agentsAPI, supabaseFetch } from '../utils/supabase';
import { sendToDeepSeekSync } from '../utils/deepseek';
import type { Agent } from '../types';

const AVATAR_COLORS = [
  'from-purple-400 to-pink-400',
  'from-blue-400 to-cyan-400',
  'from-emerald-400 to-teal-400',
  'from-orange-400 to-rose-400',
  'from-indigo-400 to-violet-400',
  'from-sky-400 to-blue-400',
  'from-green-400 to-emerald-400',
  'from-red-400 to-pink-400',
];

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  agentId?: number;
  agentName?: string;
  agentIndex?: number;
  timestamp: number;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const GroupChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
        if (userId) {
          const data = await agentsAPI.listAgents({ owner_id: userId });
          setAgents(data || []);
        }
      } catch (e) {
        console.error('Failed to load agents', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleAgent = (id: number) => {
    if (started) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startChat = () => {
    if (selectedIds.size < 2) return;
    const selected = agents.filter(a => selectedIds.has(a.id));
    setMessages([{
      id: generateId(),
      type: 'agent',
      content: `群聊已创建！参与分身：${selected.map(a => a.name).join('、')}。发送消息后所有分身会同时回复你。`,
      agentName: '系统',
      timestamp: Date.now(),
    }]);
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const buildAgentPrompt = (agent: Agent) => {
    const capabilities = Array.isArray(agent.capabilities) ? agent.capabilities.join('、') : agent.capabilities || '';
    return `你是${agent.name}，${agent.description || '一个AI数字分身'}。${capabilities ? `你擅长：${capabilities}。` : ''}你现在在群聊中，和其他分身一起回答用户的问题。请用你的专业视角给出回答，语言风格符合你的设定。`;
  };

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || responding) return;
    setInputText('');

    const selectedAgents = agents.filter(a => selectedIds.has(a.id));
    const userMsg: ChatMessage = {
      id: generateId(),
      type: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    setResponding(true);
    const history = messages.concat(userMsg);
    const userMsgs = history.filter(m => m.type === 'user').map(m => ({ role: 'user' as const, content: m.content }));

    const results = await Promise.allSettled(
      selectedAgents.map(async (agent, idx) => {
        const systemPrompt = buildAgentPrompt(agent);
        const reply = await sendToDeepSeekSync([
          { role: 'system', content: systemPrompt },
          ...userMsgs,
        ]);
        return { agent, idx, reply };
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { agent, idx, reply } = result.value;
        setMessages(prev => [...prev, {
          id: generateId(),
          type: 'agent',
          content: reply,
          agentId: agent.id,
          agentName: agent.name,
          agentIndex: selectedAgents.indexOf(agent),
          timestamp: Date.now(),
        }]);
      }
    }
    setResponding(false);
  }, [inputText, responding, messages, agents, selectedIds]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-purple-100 px-4 py-3 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate('/digital-twins')} className="p-2 rounded-xl hover:bg-purple-50 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            分身群聊
          </h1>
          {started && (
            <p className="text-xs text-slate-500">
              {selectedIds.size} 个分身在线
            </p>
          )}
        </div>
      </header>

      {/* Agent Selection */}
      {!started && (
        <div className="flex-1 p-4">
          <div className="max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-1">选择参与群聊的分身</h2>
            <p className="text-sm text-slate-500 mb-4">至少选择 2 个分身，他们将在群聊中同时回复你</p>
            <div className="space-y-2 mb-6">
              {agents.map((agent, idx) => (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedIds.has(agent.id)
                      ? 'border-purple-400 bg-purple-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{agent.name}</p>
                    <p className="text-xs text-slate-400 truncate">{agent.description || '数字分身'}</p>
                  </div>
                  {selectedIds.has(agent.id) ? (
                    <Check className="w-5 h-5 text-purple-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </button>
              ))}
              {agents.length === 0 && (
                <p className="text-center text-slate-400 py-8">你还没有创建任何分身</p>
              )}
            </div>
            <button
              onClick={startChat}
              disabled={selectedIds.size < 2}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/25"
            >
              开始群聊 ({selectedIds.size} 个分身)
            </button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      {started && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" ref={messagesEndRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.type === 'user' ? '' : ''}`}>
                {msg.type === 'agent' && msg.agentName && (
                  <div className="flex items-center gap-2 mb-1 ml-1">
                    {msg.agentName !== '系统' && (
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${AVATAR_COLORS[(msg.agentIndex ?? 0) % AVATAR_COLORS.length]} flex items-center justify-center`}>
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <span className={`text-xs font-medium ${msg.agentName === '系统' ? 'text-slate-400' : 'text-purple-600'}`}>
                      {msg.agentName}
                    </span>
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                    : msg.agentName === '系统'
                      ? 'bg-slate-100 text-slate-500 text-xs rounded-bl-md'
                      : 'bg-white border border-purple-100 text-slate-700 shadow-sm rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {responding && (
            <div className="flex justify-start">
              <div className="bg-white border border-purple-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  分身们正在思考...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      {started && (
        <div className="border-t border-purple-100 bg-white/80 backdrop-blur-lg px-4 py-3">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息，所有分身会同时回复..."
              disabled={responding}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 text-sm disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || responding}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-40 hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/25"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatPage;
