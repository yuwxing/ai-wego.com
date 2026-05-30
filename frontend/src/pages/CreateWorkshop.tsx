import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Wand2, ChevronRight, Loader2, Copy, Check, Image, User, Smile, BookMarked, Gamepad2, ArrowLeft, Send, RefreshCw, Monitor, Smartphone, Sun, Moon, Palette, Heart, Zap, Cloud, Flame, Music, Tv, Camera, Coffee, Globe, Star, CloudMoon } from 'lucide-react';
import { sendToDeepSeek } from '../utils/deepseek';
import { Card } from '../components/ui';

interface Field {
  key: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  options?: { label: string; value: string; icon?: string }[];
}

interface Template {
  name: string;
  desc: string;
  emoji: string;
  fields: Record<string, string>;
}

interface TypeConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  fields: Field[];
  templates: Template[];
  systemPrompt: string;
}

const CONFIGS: TypeConfig[] = [
  {
    id: 'wallpaper', icon: <Image className="w-5 h-5" />, label: '屏保生成', color: 'from-blue-500 to-cyan-500',
    fields: [
      { key: 'theme', label: '主题风格', icon: <Palette className="w-3.5 h-3.5" />, placeholder: '如：赛博朋克、水墨山水、星空极光',
        options: [{ label: '赛博朋克', value: '赛博朋克城市夜景，霓虹灯光' }, { label: '水墨山水', value: '中国传统水墨山水，留白意境' }, { label: '星空极光', value: '星空银河，极光流动' }, { label: '日系清新', value: '日系动漫风格，清新自然' }, { label: '抽象几何', value: '抽象几何图案，现代简约' }] },
      { key: 'color', label: '主色调', icon: <Palette className="w-3.5 h-3.5" />, placeholder: '如：蓝紫、暖橙、黑白',
        options: [{ label: '蓝紫色', value: '蓝紫色调为主，神秘深邃' }, { label: '暖橙色', value: '暖橙黄调为主，温暖治愈' }, { label: '青绿色', value: '青绿调为主，清新自然' }, { label: '粉紫色', value: '粉紫调为主，浪漫温柔' }, { label: '黑白灰', value: '黑白灰色调，简约高级' }] },
      { key: 'device', label: '适用设备', icon: <Smartphone className="w-3.5 h-3.5" />, placeholder: '手机或电脑',
        options: [{ label: '手机竖屏', value: '手机竖屏壁纸 9:16' }, { label: '电脑横屏', value: '电脑桌面壁纸 16:9' }, { label: '平板', value: '平板壁纸 4:3' }] },
      { key: 'mood', label: '氛围感', icon: <Sun className="w-3.5 h-3.5" />, placeholder: '如：宁静、炫酷、治愈',
        options: [{ label: '宁静', value: '宁静平和，让人放松' }, { label: '炫酷', value: '炫酷科技感，视觉冲击' }, { label: '治愈', value: '温暖治愈，心情愉悦' }, { label: '梦幻', value: '梦幻迷离，充满想象' }, { label: '极简', value: '极简干净，不打扰视线' }] },
    ],
    templates: [
      { name: '赛博都市', desc: '霓虹雨夜赛博朋克城市', emoji: '🌃', fields: { theme: '赛博朋克城市夜景，霓虹灯光', color: '蓝紫色调为主，神秘深邃', device: '手机竖屏壁纸 9:16', mood: '炫酷科技感，视觉冲击' } },
      { name: '星空极光', desc: '极光银河下的雪山剪影', emoji: '🌌', fields: { theme: '星空银河，极光流动', color: '青绿调为主，清新自然', device: '电脑桌面壁纸 16:9', mood: '宁静平和，让人放松' } },
      { name: '水墨江南', desc: '烟雨江南水墨画卷', emoji: '🏯', fields: { theme: '中国传统水墨山水，留白意境', color: '黑白灰色调，简约高级', device: '手机竖屏壁纸 9:16', mood: '宁静平和，让人放松' } },
      { name: '樱花物语', desc: '粉色樱花飘落校园', emoji: '🌸', fields: { theme: '日系动漫风格，清新自然', color: '粉紫调为主，浪漫温柔', device: '手机竖屏壁纸 9:16', mood: '温暖治愈，心情愉悦' } },
    ],
    systemPrompt: '你是屏保壁纸设计专家。根据用户填写的主题、色调、设备和氛围，生成屏保设计稿。包含：\n1. 画面描述（详细构图、色彩搭配、核心元素、光影效果）\n2. 设计理念（为什么这样设计）\n3. 适用场景（锁屏/桌面/浅色/深色模式建议）\n4. 推荐配色色值（HEX代码）\n用中文回复，排版清晰有条理。',
  },
  {
    id: 'avatar', icon: <User className="w-5 h-5" />, label: '头像制作', color: 'from-pink-500 to-rose-500',
    fields: [
      { key: 'style', label: '风格', icon: <Palette className="w-3.5 h-3.5" />, placeholder: '如：日系动漫、写实、Q版',
        options: [{ label: '日系动漫', value: '日系二次元动漫风格' }, { label: '写实', value: '写实风格，细节丰富' }, { label: 'Q版', value: 'Q版可爱风格' }, { label: '古风', value: '古风手绘风格' }, { label: '像素', value: '复古像素风格' }] },
      { key: 'character', label: '角色描述', icon: <User className="w-3.5 h-3.5" />, placeholder: '如：短发女生戴圆框眼镜、猫耳少年' },
      { key: 'expression', label: '表情', icon: <Smile className="w-3.5 h-3.5" />, placeholder: '如：微笑、酷、呆萌',
        options: [{ label: '微笑', value: '自然微笑，亲切友好' }, { label: '酷', value: '冷峻酷飒，不苟言笑' }, { label: '呆萌', value: '呆萌可爱，眼神无辜' }, { label: '开心', value: '开怀大笑，阳光灿烂' }, { label: '温柔', value: '温柔含蓄，浅浅微笑' }] },
      { key: 'bg', label: '背景', icon: <Image className="w-3.5 h-3.5" />, placeholder: '如：纯色渐变、樱花、星空',
        options: [{ label: '纯色渐变', value: '纯色渐变背景' }, { label: '樱花', value: '飘落的樱花背景' }, { label: '星空', value: '星空银河背景' }, { label: '抽象', value: '抽象几何图案背景' }, { label: '透明', value: '透明背景（无背景）' }] },
    ],
    templates: [
      { name: '动漫女生', desc: '短发女生微笑校园风', emoji: '👧', fields: { style: '日系二次元动漫风格', character: '短发女生，齐刘海，戴圆框眼镜，穿校服', expression: '自然微笑，亲切友好', bg: '纯色渐变背景' } },
      { name: 'Q版小猫', desc: '猫耳少年呆萌可爱', emoji: '🐱', fields: { style: 'Q版可爱风格', character: '橘猫拟人少年，猫耳猫尾，穿连帽卫衣', expression: '呆萌可爱，眼神无辜', bg: '纯色渐变背景' } },
      { name: '古风侠客', desc: '黑衣剑客冷峻霸气', emoji: '⚔️', fields: { style: '古风手绘风格', character: '古风黑衣侠客，长发束冠，佩剑', expression: '冷峻酷飒，不苟言笑', bg: '抽象几何图案背景' } },
      { name: '像素英雄', desc: '复古像素RPG主角', emoji: '🕹️', fields: { style: '复古像素风格', character: '8bit风格勇者，金发蓝衣持剑', expression: '开心自信', bg: '星空银河背景' } },
    ],
    systemPrompt: '你是头像设计专家。根据用户填写的风格、角色、表情和背景，生成个性化头像设计方案。包含：\n1. 整体设计描述（构图、色彩、风格要点）\n2. 细节刻画（发型、眼睛、服装等特征）\n3. 色彩搭配方案\n4. 适用平台建议（微信/QQ/微博/抖音/小红书等）\n用中文回复，分点列出。',
  },
  {
    id: 'emoji', icon: <Smile className="w-5 h-5" />, label: '表情包生成', color: 'from-yellow-500 to-orange-500',
    fields: [
      { key: 'topic', label: '主题', icon: <Heart className="w-3.5 h-3.5" />, placeholder: '如：打工人、猫咪、熊猫头',
        options: [{ label: '打工人', value: '打工人日常' }, { label: '猫咪', value: '猫咪卖萌搞笑' }, { label: '熊猫头', value: '熊猫头梗图' }, { label: '学生党', value: '学生党上课日常' }, { label: '吃货', value: '吃货美食表情' }] },
      { key: 'style', label: '风格', icon: <Palette className="w-3.5 h-3.5" />, placeholder: '如：手绘、梗图、文字',
        options: [{ label: '手绘风', value: '手绘涂鸦风格' }, { label: '梗图风', value: '网络梗图风格，带文字' }, { label: '文字风', value: '纯文字表情包，大字报风格' }, { label: '3D风', value: '3D渲染风格' }] },
      { key: 'count', label: '数量', icon: <Star className="w-3.5 h-3.5" />, placeholder: '生成几个表情',
        options: [{ label: '6个', value: '6' }, { label: '8个', value: '8' }, { label: '12个', value: '12' }] },
    ],
    templates: [
      { name: '打工人日记', desc: '周一摸鱼到周五下班', emoji: '💼', fields: { topic: '打工人日常', style: '网络梗图风格，带文字', count: '8' } },
      { name: '猫咪哲学', desc: '猫猫的冷笑话与人生', emoji: '🐱', fields: { topic: '猫咪卖萌搞笑', style: '手绘涂鸦风格', count: '6' } },
      { name: '考试退散', desc: '学生党考前的精神状态', emoji: '📚', fields: { topic: '学生党上课日常', style: '网络梗图风格，带文字', count: '8' } },
      { name: '干饭时间', desc: '吃货的美食哲学', emoji: '🍜', fields: { topic: '吃货美食表情', style: '手绘涂鸦风格', count: '6' } },
    ],
    systemPrompt: '你是表情包设计师。根据用户填写的主题、风格和数量，生成一套表情包设计方案。包含：\n1. 系列名称和主题说明\n2. 每个表情的详细设计（序号、文案、画面描述、使用场景）\n3. 设计风格要点（配色、字体、构图建议）\n4. 整套表情包的使用场景建议\n用中文回复，每个表情独立一段。',
  },
  {
    id: 'comic', icon: <BookMarked className="w-5 h-5" />, label: '漫画故事', color: 'from-purple-500 to-indigo-500',
    fields: [
      { key: 'genre', label: '题材', icon: <Globe className="w-3.5 h-3.5" />, placeholder: '如：校园、奇幻、悬疑',
        options: [{ label: '校园日常', value: '校园日常生活' }, { label: '奇幻冒险', value: '奇幻魔法冒险' }, { label: '悬疑推理', value: '悬疑推理' }, { label: '科幻未来', value: '科幻未来世界' }, { label: '治愈温馨', value: '治愈温馨日常' }] },
      { key: 'characters', label: '主角设定', icon: <User className="w-3.5 h-3.5" />, placeholder: '描述主角姓名、性格、外形' },
      { key: 'setting', label: '背景世界观', icon: <Globe className="w-3.5 h-3.5" />, placeholder: '如：现代校园、魔法学院、未来都市' },
      { key: 'hook', label: '故事引子', icon: <Zap className="w-3.5 h-3.5" />, placeholder: '一句话概括故事起因' },
      { key: 'panels', label: '分镜数量', icon: <Image className="w-3.5 h-3.5" />, placeholder: '4格/8格',
        options: [{ label: '4格漫画', value: '4' }, { label: '8格短篇', value: '8' }] },
    ],
    templates: [
      { name: '转学生之谜', desc: '神秘转学生的校园故事', emoji: '🏫', fields: { genre: '校园日常生活', characters: '小明，初二男生，好奇心强但胆子小；小月，神秘转学生，总是戴着帽子', setting: '普通初中校园，但有个流传已久的神秘传说', hook: '新转来的同学小月似乎和学校百年传说有关...', panels: '8' } },
      { name: '魔法学徒', desc: '菜鸟魔法师的冒险', emoji: '🔮', fields: { genre: '奇幻魔法冒险', characters: '小可，12岁魔法学徒，总是念错咒语；导师老白，退休大魔法师', setting: '漂浮在云端的魔法学院', hook: '期末考试前一天，小可意外把院长变成了青蛙...', panels: '8' } },
      { name: '未来快递员', desc: '星际快递员的日常', emoji: '🚀', fields: { genre: '科幻未来世界', characters: '星仔，18岁星际快递员，开一艘破旧的送货车', setting: '赛博朋克风格的外星星球', hook: '今天最后一单快递，地址写着"宇宙尽头"', panels: '4' } },
      { name: '猫与少年', desc: '流浪猫治愈孤独少年', emoji: '🐱', fields: { genre: '治愈温馨日常', characters: '阿杰，沉默寡言的初中生；小橘，一只会主动蹭人的流浪橘猫', setting: '南方小城的老街区', hook: '阿杰在学校没有朋友，直到他在回家路上遇到了小橘', panels: '4' } },
    ],
    systemPrompt: '你是漫画编剧。根据用户填写的题材、角色、世界观、故事引子和分镜数量，生成短篇漫画脚本。包含：\n1. 漫画标题\n2. 角色设定表（姓名、年龄、性格、外形特征）\n3. 分镜脚本（每格画面描述、对白台词、背景说明）\n4. 整体风格建议（画风、配色、字体）\n用中文回复，分镜独立编号。',
  },
  {
    id: 'pixel', icon: <Gamepad2 className="w-5 h-5" />, label: '像素游戏', color: 'from-green-500 to-emerald-500',
    fields: [
      { key: 'genre', label: '游戏类型', icon: <Gamepad2 className="w-3.5 h-3.5" />, placeholder: '如：平台跳跃、RPG、射击',
        options: [{ label: '平台跳跃', value: '平台跳跃过关' }, { label: 'RPG冒险', value: '角色扮演冒险' }, { label: '射击生存', value: '射击生存' }, { label: '模拟经营', value: '模拟经营' }, { label: '迷宫探索', value: '迷宫探索' }] },
      { key: 'theme', label: '主题风格', icon: <Palette className="w-3.5 h-3.5" />, placeholder: '如：太空、中世纪、丛林',
        options: [{ label: '太空', value: '科幻太空风格' }, { label: '中世纪', value: '中世纪奇幻风格' }, { label: '丛林', value: '热带雨林风格' }, { label: '水下', value: '深海世界风格' }, { label: '地下城', value: '黑暗地牢风格' }] },
      { key: 'hero', label: '主角设计', icon: <User className="w-3.5 h-3.5" />, placeholder: '描述主角外形和特点' },
      { key: 'mechanic', label: '核心玩法', icon: <Zap className="w-3.5 h-3.5" />, placeholder: '一句话描述核心玩法' },
    ],
    templates: [
      { name: '太空矿工', desc: '小飞船开采小行星', emoji: '🛸', fields: { genre: '射击生存', theme: '科幻太空风格', hero: '圆形小飞船，蓝色涂装，装备激光炮和采矿臂', mechanic: '驾驶飞船在小行星带采集矿石，遇到太空海盗要战斗或逃跑' } },
      { name: '勇者传说', desc: '经典RPG打怪升级', emoji: '⚔️', fields: { genre: '角色扮演冒险', theme: '中世纪奇幻风格', hero: '金发红披风勇者，手持长剑，带一只会魔法的小精灵', mechanic: '探索地图、打怪升级、收集装备、打败魔王救公主' } },
      { name: '农场物语', desc: '种田养鸡的悠闲生活', emoji: '🌾', fields: { genre: '模拟经营', theme: '田园乡村风格', hero: '红帽子农场主，穿着工装裤，拿着锄头', mechanic: '开垦土地种植作物、饲养动物、制作农产品出售、升级农场' } },
      { name: '深海探险', desc: '潜水寻宝打怪', emoji: '🐠', fields: { genre: '迷宫探索', theme: '深海世界风格', hero: '潜水员，戴圆形头盔，背氧气瓶，手持鱼叉', mechanic: '在深海迷宫中探索、收集宝藏、躲避鲨鱼、寻找出口' } },
    ],
    systemPrompt: '你是像素游戏策划师。根据用户填写的游戏类型、主题、主角和核心玩法，生成像素游戏设计方案。包含：\n1. 游戏名称和一句话简介\n2. 核心玩法详细描述\n3. 角色设计（像素风描述，含配色建议）\n4. 场景设计（关卡/地图规划）\n5. 道具和敌人列表\n6. 控制方式和操作说明\n7. 像素尺寸和分辨率建议\n用中文回复。',
  },
];

export default function CreateWorkshop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [activeType, setActiveType] = useState<string>(typeParam || 'free');
  const [form, setForm] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const activeConfig = CONFIGS.find(c => c.id === activeType);

  useEffect(() => {
    if (typeParam && CONFIGS.find(c => c.id === typeParam)) {
      setActiveType(typeParam);
      setForm({});
      setResult('');
      setStreamingText('');
    }
  }, [typeParam]);

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setForm({});
    setResult('');
    setStreamingText('');
    setCopied(false);
  };

  const applyTemplate = (tmpl: Template) => {
    setForm({ ...tmpl.fields });
    setResult('');
    setStreamingText('');
  };

  const setField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    setResult('');
    setStreamingText('');
    setCopied(false);

    try {
      let systemPrompt: string;
      let userContent: string;

      if (activeType === 'free') {
        systemPrompt = '你是AI创意助手。根据用户的描述，生成创意作品方案。用中文回复，排版清晰。';
        userContent = form['free'] || '';
        if (!userContent.trim()) { setLoading(false); return; }
      } else if (activeConfig) {
        systemPrompt = activeConfig.systemPrompt;
        const fields = activeConfig.fields.map(f =>
          `【${f.label}】${form[f.key] || '（未填写）'}`
        ).join('\n');
        userContent = `请根据以下需求生成设计方案：\n\n${fields}`;
      } else {
        setLoading(false);
        return;
      }

      const fullText = await sendToDeepSeek(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        (chunk) => {
          setStreamingText(prev => prev + chunk);
        }
      );
      setResult(fullText);
    } catch (err) {
      setResult('生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = result || streamingText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const displayText = result || streamingText;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/competitions')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">创作工坊</h1>
          <p className="text-sm text-slate-500">选择类型 → 填写/选模板 → AI生成作品</p>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        <button
          onClick={() => handleTypeChange('free')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
            activeType === 'free'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          自由创作
        </button>
        {CONFIGS.map(type => (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              activeType === type.id
                ? `bg-gradient-to-r ${type.color} text-white shadow-md`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {type.icon}
            {type.label}
          </button>
        ))}
      </div>

      {/* Free Form */}
      {activeType === 'free' && (
        <Card className="!p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">自由创作</h3>
              <p className="text-xs text-slate-400">不限类型，自由描述你的创作需求</p>
            </div>
          </div>
          <textarea
            value={form['free'] || ''}
            onChange={e => setField('free', e.target.value)}
            placeholder="描述你想要的创作内容，越详细效果越好..."
            className="w-full h-28 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none text-sm"
          />
          <button
            onClick={handleGenerate}
            disabled={!form['free']?.trim() || loading}
            className="mt-3 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</> : <><Send className="w-4 h-4" /> 开始创作</>}
          </button>
        </Card>
      )}

      {/* Template-based forms */}
      {activeConfig && (
        <>
          {/* Preset Templates */}
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 快速开始：选择一个预设模板
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeConfig.templates.map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(tmpl)}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all text-left group"
                >
                  <div className="text-xl mb-1">{tmpl.emoji}</div>
                  <div className="font-medium text-sm text-slate-800 group-hover:text-indigo-600">{tmpl.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{tmpl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <Card className="!p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeConfig.color} flex items-center justify-center text-white`}>
                {activeConfig.icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{activeConfig.label}</h3>
                <p className="text-xs text-slate-400">填写以下信息，AI为你生成设计方案</p>
              </div>
            </div>

            <div className="space-y-3">
              {activeConfig.fields.map(field => (
                <div key={field.key}>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                    {field.icon}
                    {field.label}
                  </label>
                  {field.options ? (
                    <div className="flex flex-wrap gap-1.5">
                      {field.options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setField(field.key, opt.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            form[field.key] === opt.value
                              ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={form[field.key] || ''}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI生成中...</> : <><Send className="w-4 h-4" /> 生成设计方案</>}
            </button>
          </Card>
        </>
      )}

      {/* Result */}
      {displayText && (
        <Card className="!p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-slate-900">生成结果</span>
              {loading && <span className="text-xs text-slate-400 animate-pulse">AI 正在思考...</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied ? <><Check className="w-3.5 h-3.5 text-green-600" /> 已复制</> : <><Copy className="w-3.5 h-3.5" /> 复制</>}
              </button>
              {result && !loading && (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重新生成
                </button>
              )}
            </div>
          </div>
          <div className="prose prose-sm max-w-none bg-slate-50 rounded-xl p-4 text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
            {loading && !result ? streamingText + '▌' : displayText}
          </div>
        </Card>
      )}
    </div>
  );
}