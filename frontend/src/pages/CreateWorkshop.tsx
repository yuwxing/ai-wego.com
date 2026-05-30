import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Wand2, ChevronRight, Loader2, Copy, Check, ArrowLeft, Send, RefreshCw, Palette, Zap, Music, Video, Bot, GraduationCap, Gamepad2, Star, TrendingUp, Clock, Heart, Sun, Play, X, MessageCircle } from 'lucide-react';
import { sendToDeepSeek } from '../utils/deepseek';
import { Card } from '../components/ui';

interface Field {
  key: string;
  label: string;
  placeholder: string;
  options?: { label: string; value: string }[];
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
  badge: string;
  gradient: string;
  shadow: string;
  accentClasses: { bg: string; text: string; border: string; selected: string };
  fields: Field[];
  templates: Template[];
  systemPrompt: string;
}

const CONFIGS: TypeConfig[] = [
  {
    id: 'short-video', icon: <Video className="w-5 h-5" />, label: '短视频脚本', badge: '🔥 热门', gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/25', accentClasses: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', selected: 'bg-pink-100 border-pink-300 text-pink-700' },
    fields: [
      { key: 'platform', label: '发布平台', placeholder: '抖音 / 小红书 / B站',
        options: [{ label: '抖音', value: '抖音（竖屏9:16，15-60秒）' }, { label: '小红书', value: '小红书（图文+视频，精致风格）' }, { label: 'B站', value: 'B站（横屏16:9，1-5分钟）' }, { label: '视频号', value: '微信视频号（横竖皆可）' }] },
      { key: 'topic', label: '视频主题', placeholder: '如：校园日常、学习vlog、好物推荐' },
      { key: 'style', label: '风格调性', placeholder: '如：搞笑、治愈、干货、燃',
        options: [{ label: '搞笑整活', value: '搞笑幽默，节奏明快，反转不断' }, { label: '治愈温暖', value: '温暖治愈，配乐舒缓，画面唯美' }, { label: '知识干货', value: '干货输出，信息密度高，条理清晰' }, { label: '燃向剪辑', value: '热血燃向，快节奏卡点，视觉冲击' }, { label: '沉浸体验', value: '沉浸式体验，第一人称视角，ASMR风格' }] },
      { key: 'duration', label: '视频时长', placeholder: '15秒 / 30秒 / 60秒',
        options: [{ label: '15秒', value: '15秒（极速完播，适合梗/反转）' }, { label: '30秒', value: '30秒（标准短视频，信息量适中）' }, { label: '60秒', value: '60秒（深度内容，适合知识分享）' }] },
    ],
    templates: [
      { name: '考试逆袭', desc: '从学渣到学霸的奋斗故事', emoji: '📚', fields: { platform: '抖音（竖屏9:16，15-60秒）', topic: '考前30天逆袭计划，从400分到600分', style: '热血燃向，快节奏卡点，视觉冲击', duration: '30秒（标准短视频，信息量适中）' } },
      { name: '宿舍日常', desc: '当代大学生精神状态', emoji: '🏠', fields: { platform: 'B站（横屏16:9，1-5分钟）', topic: '大学生宿舍的离谱日常，室友之间的爆笑互动', style: '搞笑幽默，节奏明快，反转不断', duration: '60秒（深度内容，适合知识分享）' } },
      { name: '好物种草', desc: '学生党必备神器推荐', emoji: '🎒', fields: { platform: '小红书（图文+视频，精致风格）', topic: '学生党提升效率的5个神器，价格不过百', style: '知识干货，信息密度高，条理清晰', duration: '30秒（标准短视频，信息量适中）' } },
      { name: '校园vlog', desc: '沉浸式体验一天校园生活', emoji: '🎬', fields: { platform: '抖音（竖屏9:16，15-60秒）', topic: '沉浸式体验大学生的一天：早八→食堂→图书馆→社团', style: '沉浸体验，第一人称视角，ASMR风格', duration: '60秒（深度内容，适合知识分享）' } },
    ],
    systemPrompt: '你是短视频编剧和策划专家。根据用户填写的平台、主题、风格和时长，生成一份可执行的短视频脚本。包含以下内容：视频标题，核心创意，分镜脚本从第一秒开始逐秒列出（每段包含画面描述、运镜方式、台词或旁白、音效或BGM、字幕文案），拍摄建议，发布优化建议。用中文回复，不要使用markdown符号如星号和井号，标题用换行和空行区分。',
  },
  {
    id: 'digital-twin', icon: <Bot className="w-5 h-5" />, label: 'AI数字分身', badge: '✨ 全新', gradient: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/25', accentClasses: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300', selected: 'bg-violet-100 border-violet-300 text-violet-700' },
    fields: [
      { key: 'role', label: '角色定位', placeholder: '如：学习助手、情感树洞、游戏队友',
        options: [{ label: '学习搭子', value: '学习搭子，陪你一起学习进步' }, { label: '情感树洞', value: '知心朋友，倾听烦恼给出建议' }, { label: '虚拟学长', value: '经验丰富的学长学姐，解答校园问题' }, { label: '游戏队友', value: '一起打游戏的搭子，吐槽聊天' }, { label: 'AI笔友', value: '文艺风格的笔友，写信交流' }] },
      { key: 'personality', label: '性格设定', placeholder: '如：温柔、搞笑、毒舌',
        options: [{ label: '温柔体贴', value: '温柔有耐心，说话轻声细语，包容理解' }, { label: '幽默搞笑', value: '活泼幽默，爱开玩笑，金句频出' }, { label: '毒舌吐槽', value: '毒舌犀利，一针见血，吐槽技能满点' }, { label: '学霸高冷', value: '高冷学霸，话少但每句都有用' }, { label: '呆萌可爱', value: '呆萌天然呆，偶尔犯傻很可爱' }] },
      { key: 'background', label: '背景故事', placeholder: '给AI分身设定一个人设背景' },
      { key: 'scene', label: '对话场景', placeholder: '日常闲聊 / 学习陪伴 / 情感咨询',
        options: [{ label: '日常闲聊', value: '日常闲聊，分享生活趣事和心情' }, { label: '学习陪伴', value: '一起学习、督促打卡、解答问题' }, { label: '情感咨询', value: '倾听烦恼，给出情感建议和安慰' }, { label: '脑洞聊天', value: '天马行空的想象力对话，一起编故事' }] },
    ],
    templates: [
      { name: '温柔学姐', desc: '暖心陪伴学习的学姐', emoji: '👩‍🎓', fields: { role: '学习搭子，陪你一起学习进步', personality: '温柔有耐心，说话轻声细语，包容理解', background: '大四学姐，成绩年级第一，考研上岸985，课余喜欢帮助学弟学妹', scene: '一起学习、督促打卡、解答问题' } },
      { name: '搞笑室友', desc: '宿舍里最皮的兄弟', emoji: '😎', fields: { role: '一起打游戏的搭子，吐槽聊天', personality: '活泼幽默，爱开玩笑，金句频出', background: '宿舍里的气氛担当，全校最会整活的男人，但关键时刻也很靠谱', scene: '日常闲聊，分享生活趣事和心情' } },
      { name: '知心树洞', desc: '倾听你所有烦恼', emoji: '🌲', fields: { role: '知心朋友，倾听烦恼给出建议', personality: '温柔有耐心，说话轻声细语，包容理解', background: '心理学专业学生，长期担任学校心理热线志愿者，擅长倾听和共情', scene: '倾听烦恼，给出情感建议和安慰' } },
      { name: '毒舌学霸', desc: '骂醒你的学习搭子', emoji: '📖', fields: { role: '学习搭子，陪你一起学习进步', personality: '毒舌犀利，一针见血，吐槽技能满点', background: '奥赛金牌得主，保送清华，最看不惯别人不努力的样子', scene: '一起学习、督促打卡、解答问题' } },
    ],
    systemPrompt: '你是AI角色设计专家。根据用户填写的角色定位、性格、背景和对话场景，设计一个完整的AI数字分身角色设定。包含：角色档案（姓名、年龄、身份、口头禅）、性格特征（3到5个关键词，描述说话方式和语气）、背景故事、对话风格示例（5个示例对话）、知识库建议、形象描述。用中文回复，不要使用markdown符号如星号和井号，标题用换行和空行区分。',
  },
  {
    id: 'music', icon: <Music className="w-5 h-5" />, label: 'AI音乐创作', badge: '🎵 新潮', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25', accentClasses: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', selected: 'bg-amber-100 border-amber-300 text-amber-700' },
    fields: [
      { key: 'genre', label: '音乐风格', placeholder: '如：流行、Rap、古风、电子',
        options: [{ label: '流行', value: '流行Pop，旋律上口，传唱度高' }, { label: '说唱Rap', value: '说唱Hip-Hop，节奏感强，歌词犀利' }, { label: '古风', value: '古风，中国风旋律，诗意歌词' }, { label: '电子', value: '电子Electronic，合成器音色，律动感' }, { label: '民谣', value: '民谣Folk，吉他伴奏，叙事感强' }, { label: 'R&B', value: 'R&B，转音丰富，氛围感强' }] },
      { key: 'theme', label: '创作主题', placeholder: '如：青春、梦想、暗恋、毕业' },
      { key: 'mood', label: '情绪基调', placeholder: '如：欢快、伤感、燃、治愈',
        options: [{ label: '欢快元气', value: '欢快元气，正能量满满' }, { label: '温柔伤感', value: '温柔伤感，触动心弦' }, { label: '热血燃向', value: '热血励志，让人充满力量' }, { label: '治愈温暖', value: '治愈温暖，像冬日阳光' }, { label: '酷飒炸裂', value: '酷飒有态度，个性十足' }] },
    ],
    templates: [
      { name: '毕业不说再见', desc: '写给青春的一首歌', emoji: '🎓', fields: { genre: '流行Pop，旋律上口，传唱度高', theme: '毕业季告别，感谢相遇，期待重逢', mood: '温柔伤感，触动心弦' } },
      { name: '少年自有锋芒', desc: '热血励志说唱', emoji: '🎤', fields: { genre: '说唱Hip-Hop，节奏感强，歌词犀利', theme: '不被定义的青春，勇敢做自己', mood: '热血励志，让人充满力量' } },
      { name: '烟雨入江南', desc: '唯美古风词曲', emoji: '🏯', fields: { genre: '古风，中国风旋律，诗意歌词', theme: '江南烟雨中的邂逅与离别', mood: '温柔伤感，触动心弦' } },
      { name: '夏日汽水', desc: '元气满满的夏日恋曲', emoji: '🥤', fields: { genre: '流行Pop，旋律上口，传唱度高', theme: '夏日暗恋，甜甜的校园爱情', mood: '欢快元气，正能量满满' } },
    ],
    systemPrompt: '你是AI音乐创作人。根据用户填写的风格、主题和情绪，生成一份完整的音乐创作方案。包含：歌曲名称（3个备选并解释寓意）、歌词（主歌2段、副歌、桥段，标注押韵）、曲风描述（速度BPM、调式、乐器编排）、结构编排、演唱建议、封面设计概念。用中文回复，歌词分段清晰，不要使用markdown符号如星号和井号。',
  },
  {
    id: 'study-boost', icon: <GraduationCap className="w-5 h-5" />, label: '学习加速器', badge: '📚', gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/25', accentClasses: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', selected: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
    fields: [
      { key: 'subject', label: '学科/知识点', placeholder: '如：英语语法、二次函数、牛顿定律',
        options: [{ label: '英语', value: '英语（词汇、语法、作文）' }, { label: '数学', value: '数学（函数、几何、概率）' }, { label: '物理', value: '物理（力学、电学、光学）' }, { label: '语文', value: '语文（古诗文、作文、阅读理解）' }, { label: '化学', value: '化学（方程式、实验、元素周期表）' }, { label: '历史', value: '历史（时间线、事件、人物）' }] },
      { key: 'format', label: '输出格式', placeholder: '如：知识卡片、思维导图、记忆口诀',
        options: [{ label: '知识卡片', value: '知识卡片（一页一个知识点，图文并茂）' }, { label: '思维导图', value: '思维导图（层级结构，关联清晰）' }, { label: '记忆口诀', value: '记忆口诀（朗朗上口，过目不忘）' }, { label: '例题精讲', value: '例题精讲（典型题+解题思路+变式训练）' }, { label: '作文范文', value: '作文范文（题目+框架+范文+点评）' }] },
      { key: 'difficulty', label: '难度', placeholder: '中考 / 高考 / 大学',
        options: [{ label: '中考', value: '中考难度（初三水平）' }, { label: '高考', value: '高考难度（高中水平）' }, { label: '大学', value: '大学难度（高等水平）' }] },
      { key: 'focus', label: '痛点/重点', placeholder: '最想突破的知识点或题型' },
    ],
    templates: [
      { name: '英语时态通', desc: '一张图搞定16种时态', emoji: '📖', fields: { subject: '英语（词汇、语法、作文）', format: '思维导图（层级结构，关联清晰）', difficulty: '高考难度（高中水平）', focus: '动词时态总是混淆，特别是完成时和进行时的区别' } },
      { name: '函数图像集', desc: '初中函数一网打尽', emoji: '📈', fields: { subject: '数学（函数、几何、概率）', format: '知识卡片（一页一个知识点，图文并茂）', difficulty: '中考难度（初三水平）', focus: '一次函数、二次函数、反比例函数的图像和性质' } },
      { name: '古诗文速记', desc: '高考必背篇目口诀', emoji: '📜', fields: { subject: '语文（古诗文、作文、阅读理解）', format: '记忆口诀（朗朗上口，过目不忘）', difficulty: '高考难度（高中水平）', focus: '高考必背64篇古诗文，容易忘记和混淆' } },
      { name: '物理公式卡', desc: '力学电磁公式+例题', emoji: '⚡', fields: { subject: '物理（力学、电学、光学）', format: '例题精讲（典型题+解题思路+变式训练）', difficulty: '高考难度（高中水平）', focus: '牛顿定律和电磁学的综合应用题' } },
    ],
    systemPrompt: '你是学习方法和知识整理专家。根据用户填写的学科、输出格式、难度和重点，生成一份高效的学习资料。包含：学习目标、核心内容（根据所选格式输出知识卡片或思维导图或口诀或例题或范文）、记忆技巧、易错提醒、进阶练习（2到3道检测题附答案和解析）。排版清晰适合打印或截图保存，不要使用markdown符号如星号和井号。',
  },
  {
    id: 'game-design', icon: <Gamepad2 className="w-5 h-5" />, label: '游戏创作', badge: '🎮', gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/25', accentClasses: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', selected: 'bg-blue-100 border-blue-300 text-blue-700' },
    fields: [
      { key: 'genre', label: '游戏类型', placeholder: '如：点击收集、跑酷、打地鼠',
        options: [{ label: '点击收集', value: 'clicker' }, { label: '跑酷/躲避', value: 'runner' }, { label: '打地鼠/反应', value: 'reaction' }, { label: '猜谜/问答', value: 'quiz' }, { label: '消除/配对', value: 'match' }] },
      { key: 'theme', label: '主题风格', placeholder: '如：太空、校园、动物、中国风',
        options: [{ label: '太空冒险', value: '太空' }, { label: '校园生活', value: '校园' }, { label: '可爱动物', value: '动物' }, { label: '中国风', value: '中国风' }, { label: '奇幻魔法', value: '奇幻' }] },
      { key: 'hero', label: '主角/元素', placeholder: '如：小火箭、熊猫、侠客' },
      { key: 'mechanic', label: '玩法一句话', placeholder: '如：点击屏幕跳跃躲避障碍、配对两张相同卡片' },
    ],
    templates: [
      { name: '太空拾荒者', desc: '控制飞船收集星星躲避陨石', emoji: '🚀', fields: { genre: 'runner', theme: '太空', hero: '蓝色小飞船', mechanic: '按空格/点击让飞船上下移动，躲避陨石收集星星' } },
      { name: '熊猫吃竹笋', desc: '熊猫左右移动接住竹笋', emoji: '🐼', fields: { genre: 'clicker', theme: '动物', hero: '一只圆滚滚的熊猫', mechanic: '左右移动熊猫接住从上方掉落的竹笋，避开炸弹' } },
      { name: '诗词大闯关', desc: '古诗填空问答挑战', emoji: '📜', fields: { genre: 'quiz', theme: '中国风', hero: '小书生', mechanic: '看到上一句古诗，从四个选项中选出正确的下一句' } },
      { name: '记忆翻牌', desc: '翻牌配对考验记忆力', emoji: '🃏', fields: { genre: 'match', theme: '校园', hero: '卡牌上的小动物', mechanic: '点击翻牌，两张相同则消除，全部消除即过关' } },
    ],
    systemPrompt: '你是一个HTML游戏开发专家。根据用户填写的游戏类型、主题风格、主角和玩法描述，生成一个可直接运行的HTML游戏文件。\n\n要求：\n第一，输出完整的HTML文件，包含内嵌CSS和JavaScript。\n第二，游戏画面精美，配色和谐，适合学生群体。\n第三，使用Canvas或DOM操作实现游戏逻辑。\n第四，包含游戏标题、开始按钮、得分或计时显示。\n第五，支持键盘和触摸操作，移动端兼容。\n第六，游戏要有明确的结束条件和重新开始功能。\n第七，输出格式：先用代码块包裹HTML代码，然后附上玩法说明。\n\n确保代码完整可运行，所有资源自包含，不使用外部图片或CDN链接。不要使用markdown符号如星号和井号，标题用换行和空行区分即可。',
  },
];

const FREE_SYSTEM_PROMPT = '你是AI创意助手，擅长将用户的想法落地为可执行的创作方案。根据用户描述的创作需求，生成详细的方案。包含：方案概述、执行步骤、所需工具或资源、预期效果。用中文回复，排版清晰，不要使用markdown符号如星号和井号。';

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
  const [showAll, setShowAll] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const activeConfig = CONFIGS.find(c => c.id === activeType);

  const extractGameHtml = (text: string): string | null => {
    const match = text.match(/```html\s*([\s\S]*?)```/);
    if (match) return match[1].trim();
    if (text.trim().startsWith('<!DOCTYPE html') || text.trim().startsWith('<html') || text.trim().startsWith('<style') || text.trim().startsWith('<script') || text.trim().startsWith('<div') || text.trim().startsWith('<canvas')) {
      return text.trim();
    }
    return null;
  };

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
      if (activeType === 'free') {
        const content = form['free'] || '';
        if (!content.trim()) { setLoading(false); return; }
        const fullText = await sendToDeepSeek(
          [
            { role: 'system', content: FREE_SYSTEM_PROMPT },
            { role: 'user', content }
          ],
          (chunk) => setStreamingText(prev => prev + chunk)
        );
        setResult(fullText);
      } else if (activeConfig) {
        const fields = activeConfig.fields.map(f =>
          `【${f.label}】${form[f.key] || '（未填写）'}`
        ).join('\n');
        const maxTokens = activeConfig.id === 'game-design' ? 8192 : undefined;
        const fullText = await sendToDeepSeek(
          [
            { role: 'system', content: activeConfig.systemPrompt },
            { role: 'user', content: `请根据以下需求生成方案：\n\n${fields}` }
          ],
          (chunk) => setStreamingText(prev => prev + chunk),
          undefined,
          maxTokens
        );
        setResult(fullText);
      }
    } catch {
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

    const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: '你好！我是创作工坊的AI助手。你可以把生成的内容粘贴给我，我能帮你继续优化、改写、解释，或者回答你的任何问题。' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    try {
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMsg });
      let full = '';
      const res = await sendToDeepSeek(
        [{ role: 'system', content: '你是创作工坊的AI助手，回答简洁有用，不要使用markdown符号。' }, ...history],
        (chunk) => { full += chunk; },
        undefined,
        4096
      );
      setChatMessages(prev => [...prev, { role: 'assistant', content: full }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '抱歉，出错了，请稍后再试。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const displayText = result || streamingText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/competitions')} className="p-2.5 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-sm border border-slate-200/50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">创作工坊</h1>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full border border-indigo-200/50">AI 赋能</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">选创作类型 → 填需求/选模板 → AI 生成专业方案</p>
          </div>
        </div>

        {/* 创作类型标签 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 shadow-sm border border-slate-200/50 mb-6">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => handleTypeChange('free')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeType === 'free'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              自由创作
            </button>
            {CONFIGS.slice(0, showAll ? CONFIGS.length : 3).map(type => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeType === type.id
                    ? `bg-gradient-to-r ${type.gradient} text-white shadow-md ${type.shadow}`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
            {CONFIGS.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shrink-0"
              >
                {showAll ? '收起 ▲' : `更多 ▼`}
              </button>
            )}
          </div>
        </div>

        {/* 自由创作 */}
        {activeType === 'free' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">自由创作</h3>
                <p className="text-xs text-slate-400">不限类型，自由描述你的创作需求，AI 全程辅助</p>
              </div>
            </div>
            <textarea
              value={form['free'] || ''}
              onChange={e => setField('free', e.target.value)}
              placeholder="描述你想要创作的内容，越详细效果越好..."
              className="w-full h-32 px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all resize-none text-sm placeholder:text-slate-400"
            />
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1" />
              <button
                onClick={handleGenerate}
                disabled={!form['free']?.trim() || loading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-indigo-500/20"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</> : <><Send className="w-4 h-4" /> 开始创作</>}
              </button>
            </div>
          </div>
        )}

        {/* 模板选择 + 表单 */}
        {activeConfig && (
          <>
            {/* 预设模板 */}
            <div className="mb-5">
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> 快速开始 — 选择一个模板，一键填充
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeConfig.templates.map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => applyTemplate(tmpl)}
                    className="group p-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
                  >
                    <div className="text-2xl mb-2">{tmpl.emoji}</div>
                    <div className="font-semibold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">{tmpl.name}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">{tmpl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 表单区域 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeConfig.gradient} flex items-center justify-center text-white shadow-md ${activeConfig.shadow}`}>
                  {activeConfig.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{activeConfig.label}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${activeConfig.accentClasses.bg} ${activeConfig.accentClasses.text}`}>{activeConfig.badge}</span>
                  </div>
                  <p className="text-xs text-slate-400">填写需求，AI 为你生成专业方案</p>
                </div>
              </div>

              <div className="space-y-4">
                {activeConfig.fields.map(field => (
                  <div key={field.key}>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                    {field.options ? (
                      <div className="flex flex-wrap gap-1.5">
                        {field.options.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setField(field.key, opt.value)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              form[field.key] === opt.value
                                ? activeConfig.accentClasses.selected
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
                        className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-sm placeholder:text-slate-400"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-5 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> AI 正在创作...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> 生成方案</>
                )}
              </button>
            </div>
          </>
        )}

        {/* 游戏预览弹窗 */}
        {showPreview && previewHtml && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-800 text-sm">游戏试玩</span>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-slate-900 min-h-[500px]">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full min-h-[500px]"
                  title="游戏预览"
                  sandbox="allow-scripts"
                />
              </div>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400">游戏代码由 AI 生成，刷新页面可重新开始</span>
                <button
                  onClick={() => setPreviewHtml(extractGameHtml(result!)!)}
                  className="px-3 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors text-slate-600 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> 重启游戏
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI 助手聊天入口 */}
        <div className="text-center mt-8">
          <button
            onClick={() => setChatOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full border border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-slate-600 hover:text-indigo-600"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium text-sm">粘贴到这里，AI 帮你继续处理</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </button>
          <p className="text-xs text-slate-400 mt-2">把生成的内容粘贴到对话框，让AI帮你优化、改写或回答疑问</p>
        </div>

        {/* AI 聊天弹窗 */}
        {chatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">创作助手</span>
                  <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">在线</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] bg-slate-50/50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-tr-sm'
                        : 'bg-white text-slate-700 rounded-tl-sm shadow-sm border border-slate-100'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                    placeholder="粘贴内容或输入问题..."
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={handleChatSend}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {displayText && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900">创作方案</span>
                {loading && <span className="text-xs text-slate-400 animate-pulse ml-1">AI 思考中...</span>}
              </div>
              <div className="flex gap-2">
                {activeType === 'game-design' && result && !loading && extractGameHtml(result) && (
                  <button
                    onClick={() => { setPreviewHtml(extractGameHtml(result)!); setShowPreview(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-md transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> 试玩
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                >
                  {copied ? <><Check className="w-3.5 h-3.5 text-green-600" /> 已复制</> : <><Copy className="w-3.5 h-3.5" /> 复制</>}
                </button>
                {result && !loading && (
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> 重新生成
                  </button>
                )}
              </div>
            </div>
            <div className="prose prose-sm max-w-none bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-200/50">
              {loading && !result ? streamingText + '▌' : displayText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
