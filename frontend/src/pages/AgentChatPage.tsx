import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import { agentsAPI, supabaseFetch } from '../utils/supabase';
import { getApiKey } from '../utils/deepseek';
import type { Agent, Task } from '../types';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

export const AgentChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agentId = Number(id);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [userData, setUserData] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch agent + user data
  useEffect(() => {
    if (!agentId) return;
    (async () => {
      try {
        const agentData = await agentsAPI.getAgent(agentId);
        if (agentData) {
          setAgent(agentData);
          setMessages([{
            id: generateId(),
            role: 'assistant',
            content: `你好！我是${agentData.name}，你的数字分身。有什么我可以帮你的吗？`,
            timestamp: Date.now(),
          }]);
        }
        // Fetch user data for context injection
        const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
        if (userId) {
          const parts: string[] = [];
          try {
            const userRes = await supabaseFetch(`users?id=eq.${userId}&select=token_balance,created_at`);
            if (userRes?.[0]) {
              parts.push(`用户ID: ${userId}`);
              parts.push(`积分余额: ${userRes[0].token_balance}`);
              parts.push(`注册时间: ${new Date(userRes[0].created_at).toLocaleDateString('zh-CN')}`);
            }
          } catch (_) {}
          try {
            const txRes = await supabaseFetch(`transactions?user_id=eq.${userId}&order=created_at.desc&limit=5`);
            if (txRes?.length > 0) {
              parts.push('\n最近交易记录:');
              txRes.forEach((tx: any) => {
                parts.push(`  ${new Date(tx.created_at).toLocaleDateString('zh-CN')} ${tx.type || '交易'} ${tx.amount > 0 ? '+' : ''}${tx.amount} 积分`);
              });
            }
          } catch (_) {}
          try {
            const taskRes: Task[] = await supabaseFetch(`tasks?publisher_id=eq.${userId}&status=eq.open&limit=3`);
            if (taskRes?.length > 0) {
              parts.push('\n当前进行中的任务:');
              taskRes.forEach((t: Task) => {
                parts.push(`  ${t.title}（预算: ${t.budget} 积分）`);
              });
            }
          } catch (_) {}
          setUserData(parts.join('\n'));
        }
      } catch (err) {
        setError('加载智能体失败');
      }
    })();
  }, [agentId]);

  // Build system prompt with agent personality + user data
  const buildSystemPrompt = useCallback(() => {
    if (!agent) return '';
    const capabilities = Array.isArray(agent.capabilities)
      ? agent.capabilities.map((c: any) => typeof c === 'string' ? c : c.category || '').filter(Boolean).join('、')
      : '';
    return `你是${agent.name}，一位AI数字分身智能体。
描述: ${agent.description || '智能助手'}
${capabilities ? `擅长领域: ${capabilities}` : ''}
你用热情、友好的语气与用户交流，提供专业、有价值的帮助。
输出简洁，不使用任何格式符号（* # 等）。

当前用户信息:
${userData || '暂无用户数据'}`;
  }, [agent, userData]);

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakMessage = useCallback((text: string) => {
    if (!ttsSupported || !voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[?#*【】\u{1F600}-\u{1F64F}]/gu, ''));
      utterance.lang = 'zh-CN';
      utterance.rate = 1.1;
      utterance.pitch = 1.6;
      utterance.onend = () => {};
      utterance.onerror = () => {};
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  }, [ttsSupported, voiceEnabled]);

  const callDeepSeekAPI = async (userMessage: string, history: Message[]): Promise<string> => {
    const recent = history.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const body = {
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        ...recent,
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 800,
    };
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const resp = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getApiKey()}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!resp.ok) throw new Error(`API请求失败: ${resp.status}`);
        const data = await resp.json();
        return data.choices?.[0]?.message?.content || '抱歉，我没有收到回复。';
      } catch (err) {
        if (attempt === 2) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw new Error('API调用失败');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const apiKey = getApiKey();
    if (!apiKey || apiKey === 'sk-6b389e1afd534d07b9d63b8aca7320b6') {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: '请先在"系统中心 → API密钥"中配置你自己的DeepSeek API密钥后再和我聊天哦～',
        timestamp: Date.now(),
      }]);
      return;
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await callDeepSeekAPI(userMsg.content, messages);
      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (voiceEnabled) speakMessage(response);
    } catch (err) {
      setError('发送失败，请检查网络后重试');
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: '哎呀，网络好像有点问题呢... 再试一次好吗？',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-purple-50 text-purple-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800">{agent.name}</h1>
                  <p className="text-xs text-slate-500">数字分身</p>
                </div>
              </div>
            </div>
            {ttsSupported && (
              <button
                onClick={() => setVoiceEnabled(v => !v)}
                className={`p-2 rounded-xl transition-colors ${
                  voiceEnabled ? 'bg-pink-100 text-pink-600' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
                title={voiceEnabled ? '关闭语音' : '开启语音'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto py-4 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                  我
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                  : 'bg-white/90 backdrop-blur-sm border border-purple-100 text-slate-700 rounded-bl-md'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm border border-purple-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">{error}</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-purple-100 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`对 ${agent.name} 说点什么...`}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-slate-700 placeholder-slate-400 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50 hover:shadow-lg transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
