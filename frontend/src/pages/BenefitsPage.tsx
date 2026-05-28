import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mic, FileText, Zap, Flame, Gift, Star, ChevronRight, Trophy, Calendar, Clock, Sparkles, ArrowRight, Target, Layers } from 'lucide-react';

interface BenefitCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  progress: number;
  max: number;
  unlocked: boolean;
  link?: string;
  color: string;
}

const MOCK_STREAK = 12;
const MOCK_TOTAL_POINTS = 3840;
const MOCK_TODAY_TASKS = {
  listening: 1,
  vocab: 2,
  daily: 1,
};

export default function BenefitsPage() {
  const navigate = useNavigate();

  const [streak, setStreak] = useState(MOCK_STREAK);
  const [totalPoints, setTotalPoints] = useState(MOCK_TOTAL_POINTS);
  const [todayTasks, setTodayTasks] = useState(MOCK_TODAY_TASKS);

  const benefitCards: BenefitCard[] = [
    {
      id: 'vocab',
      icon: <BookOpen className="w-6 h-6" />,
      title: '背单词加成',
      desc: '今日背单词获得 2x 经验加成',
      progress: todayTasks.vocab,
      max: 10,
      unlocked: todayTasks.vocab > 0,
      link: '/word-cards',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'listening',
      icon: <Mic className="w-6 h-6" />,
      title: '听说训练奖励',
      desc: '完成听说训练额外 +50 金币',
      progress: todayTasks.listening,
      max: 3,
      unlocked: todayTasks.listening > 0,
      link: '/listening-speaking',
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'daily',
      icon: <FileText className="w-6 h-6" />,
      title: '每日训练津贴',
      desc: '完成每日训练送 30 积分',
      progress: todayTasks.daily,
      max: 1,
      unlocked: todayTasks.daily > 0,
      link: '/english-daily',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'pet',
      icon: <Sparkles className="w-6 h-6" />,
      title: '宠物解锁进度',
      desc: streak >= 3 ? '已解锁新宠物！去领养' : `再坚持 ${3 - streak} 天解锁新宠物`,
      progress: Math.min(streak, 3),
      max: 3,
      unlocked: streak >= 3,
      link: '/adopt',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const today = new Date().getDay();
  const chinaDay = today === 0 ? 6 : today - 1;

  const checkInDays = [true, true, true, true, true, false, false];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 pb-24">
      {/* 头部 */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 text-white px-5 pt-8 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">学习福利中心</h1>
            <div className="bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              {totalPoints} 积分
            </div>
          </div>
          <p className="text-white/80 text-sm">坚持学习，解锁更多福利和宠物 ✨</p>
        </div>
      </div>

      {/* 连续打卡统计 */}
      <div className="max-w-lg mx-auto -mt-5 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-[#1E293B]">连续打卡</span>
            </div>
            <span className="text-2xl font-bold text-orange-500">{streak}<span className="text-sm text-[#94A3B8]"> 天</span></span>
          </div>

          <div className="flex justify-between items-center">
            {weekDays.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className={`text-xs ${i === chinaDay ? 'text-purple-600 font-bold' : 'text-[#94A3B8]'}`}>{day}</span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  checkInDays[i] ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm' : 'bg-[#F1F5F9] text-[#CBD5E1]'
                }`}>
                  {checkInDays[i] ? '✓' : (i === chinaDay ? '·' : '')}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
              <div className="flex items-center gap-1.5 text-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-[#1E293B]">今日已完成</span>
              </div>
              <div className="mt-1 flex gap-3 text-xs text-[#64748B]">
                <span>听说 {todayTasks.listening}/3</span>
                <span>背词 {todayTasks.vocab}/10</span>
                <span>训练 {todayTasks.daily}/1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 权益福利卡 */}
      <div className="max-w-lg mx-auto mt-4 px-4">
        <h2 className="text-lg font-bold text-[#1E293B] mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-500" />
          今日福利
        </h2>
        <div className="space-y-3">
          {benefitCards.map((card) => (
            <div
              key={card.id}
              className={`bg-white rounded-2xl border p-4 transition-all ${
                card.unlocked ? 'border-purple-200 shadow-sm' : 'border-gray-100 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1E293B] text-sm">{card.title}</h3>
                    {card.unlocked && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">已解锁</span>
                    )}
                  </div>
                  <p className="text-[#94A3B8] text-xs mt-0.5">{card.desc}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          card.unlocked ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-purple-400 to-pink-400'
                        }`}
                        style={{ width: `${Math.min(100, (card.progress / card.max) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#94A3B8]">{card.progress}/{card.max}</span>
                  </div>
                </div>
                {card.link && card.unlocked && (
                  <button
                    onClick={() => navigate(card.link!)}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 hover:bg-purple-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="max-w-lg mx-auto mt-5 px-4">
        <h2 className="text-lg font-bold text-[#1E293B] mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          开始学习
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/listening-speaking')}
            className="bg-white rounded-2xl p-4 border border-pink-100 hover:shadow-md hover:border-pink-200 transition-all text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto mb-2 text-white shadow-sm">
              <Mic className="w-6 h-6" />
            </div>
            <div className="font-bold text-[#1E293B] text-sm">听说训练</div>
            <div className="text-[#94A3B8] text-[10px] mt-0.5">今日 {todayTasks.listening}/3 次</div>
          </button>

          <button
            onClick={() => navigate('/word-cards')}
            className="bg-white rounded-2xl p-4 border border-indigo-100 hover:shadow-md hover:border-indigo-200 transition-all text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mx-auto mb-2 text-white shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="font-bold text-[#1E293B] text-sm">背单词</div>
            <div className="text-[#94A3B8] text-[10px] mt-0.5">今日 {todayTasks.vocab}/10 词</div>
          </button>

          <button
            onClick={() => navigate('/english-daily')}
            className="bg-white rounded-2xl p-4 border border-emerald-100 hover:shadow-md hover:border-emerald-200 transition-all text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-2 text-white shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div className="font-bold text-[#1E293B] text-sm">每日训练</div>
            <div className="text-[#94A3B8] text-[10px] mt-0.5">
              {todayTasks.daily >= 1 ? '已完成 ✓' : '未开始'}
            </div>
          </button>
        </div>
      </div>

      {/* 底部积分规则 */}
      <div className="max-w-lg mx-auto mt-5 px-4">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-4">
          <h3 className="font-bold text-[#1E293B] text-sm flex items-center gap-1.5 mb-3">
            <Layers className="w-4 h-4 text-purple-500" />
            积分获取规则
          </h3>
          <div className="space-y-2 text-xs text-[#64748B]">
            <div className="flex justify-between">
              <span>每日首次登录</span>
              <span className="font-medium text-purple-600">+10 积分</span>
            </div>
            <div className="flex justify-between">
              <span>完成一次听说训练</span>
              <span className="font-medium text-purple-600">+30 积分</span>
            </div>
            <div className="flex justify-between">
              <span>背完 10 个单词</span>
              <span className="font-medium text-purple-600">+20 积分</span>
            </div>
            <div className="flex justify-between">
              <span>完成每日训练</span>
              <span className="font-medium text-purple-600">+30 积分</span>
            </div>
            <div className="flex justify-between">
              <span>连续打卡满 3 天</span>
              <span className="font-medium text-purple-600">解锁新宠物 🎉</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
