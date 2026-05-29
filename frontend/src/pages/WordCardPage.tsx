import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, Check, X, RefreshCw, Cloud } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

type Grade = 7 | 8 | 9 | 10;

interface Word {
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  exampleCn: string;
  options: string[];
  unit?: number;
}

interface VocabProgress {
  grade: Grade;
  index: number;
  learned: string[];
  wrongWords: { word: string; meaning: string }[];
  correct: number;
  total: number;
}

const GRADE_LABELS: Record<Grade, string> = { 7: '七年级上', 8: '七年级下', 9: '八年级上', 10: '八年级下' };

const GRADE_UNIT_LABELS: Record<Grade, string[]> = {
  7: ['Starter U1', 'Starter U2', 'Starter U3', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7'],
  8: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9', 'Unit 10', 'Unit 11', 'Unit 12'],
  9: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9', 'Unit 10'],
  10: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9', 'Unit 10'],
};

const WORD_DATA: Record<Grade, Word[]> = {
  7: [
    // Starter Unit 1: Hello (打招呼问候)
    { word: 'unit', meaning: '单元', phonetic: '/ˈjuːnɪt/', example: 'We are in Unit 1.', exampleCn: '我们在第一单元。', options: ['单元', '部分', '章节', '课程'], unit: 0 },
    { word: 'section', meaning: '部分', phonetic: '/ˈsekʃn/', example: 'Read Section A.', exampleCn: '阅读A部分。', options: ['部分', '全部', '章节', '单元'], unit: 0 },
    { word: 'greet', meaning: '问候', phonetic: '/ɡriːt/', example: 'We greet each other.', exampleCn: '我们互相问候。', options: ['问候', '告别', '欢迎', '感谢'], unit: 0 },
    { word: 'each', meaning: '每个', phonetic: '/iːtʃ/', example: 'Each student has a book.', exampleCn: '每个学生有一本书。', options: ['每个', '一些', '所有', '许多'], unit: 0 },
    { word: 'other', meaning: '其他的', phonetic: '/ˈʌðə(r)/', example: 'I like the other one.', exampleCn: '我喜欢另一个。', options: ['其他的', '相同的', '不同的', '特别的'], unit: 0 },
    { word: 'everyone', meaning: '每个人', phonetic: '/ˈevriwʌn/', example: 'Hello everyone!', exampleCn: '大家好！', options: ['每个人', '某人', '任何人', '没有人'], unit: 0 },
    { word: 'start', meaning: '开始', phonetic: '/stɑːt/', example: 'Let\'s start the class.', exampleCn: '我们开始上课吧。', options: ['开始', '结束', '继续', '停止'], unit: 0 },
    { word: 'conversation', meaning: '交谈', phonetic: '/ˌkɒnvəˈseɪʃn/', example: 'We have a conversation.', exampleCn: '我们进行了一次交谈。', options: ['交谈', '演讲', '讨论', '辩论'], unit: 0 },
    { word: 'spell', meaning: '拼写', phonetic: '/spel/', example: 'How do you spell your name?', exampleCn: '你怎么拼写你的名字？', options: ['拼写', '阅读', '写作', '发音'], unit: 0 },
    { word: 'bell', meaning: '铃', phonetic: '/bel/', example: 'The bell rings at 8.', exampleCn: '八点铃响。', options: ['铃', '钟', '哨', '鼓'], unit: 0 },
    // Starter Unit 2: Keep Tidy (保持整洁)
    { word: 'bottle', meaning: '瓶子', phonetic: '/ˈbɒtl/', example: 'The bottle is on the desk.', exampleCn: '瓶子在书桌上。', options: ['瓶子', '杯子', '碗', '盒子'], unit: 1 },
    { word: 'eraser', meaning: '橡皮', phonetic: '/ɪˈreɪzə(r)/', example: 'I need an eraser.', exampleCn: '我需要一块橡皮。', options: ['橡皮', '铅笔', '钢笔', '尺子'], unit: 1 },
    { word: 'key', meaning: '钥匙', phonetic: '/kiː/', example: 'This is my key.', exampleCn: '这是我的钥匙。', options: ['钥匙', '锁', '门', '窗户'], unit: 1 },
    { word: 'thing', meaning: '东西', phonetic: '/θɪŋ/', example: 'Put your things away.', exampleCn: '把你的东西收好。', options: ['东西', '地方', '时间', '方式'], unit: 1 },
    { word: 'need', meaning: '需要', phonetic: '/niːd/', example: 'I need a pen.', exampleCn: '我需要一支钢笔。', options: ['需要', '想要', '拥有', '使用'], unit: 1 },
    // Starter Unit 3: Welcome (欢迎)
    { word: 'fun', meaning: '乐趣', phonetic: '/fʌn/', example: 'We have fun at school.', exampleCn: '我们在学校很开心。', options: ['乐趣', '工作', '学习', '练习'], unit: 2 },
    { word: 'yard', meaning: '院子', phonetic: '/jɑːd/', example: 'The cat is in the yard.', exampleCn: '猫在院子里。', options: ['院子', '花园', '公园', '操场'], unit: 2 },
    { word: 'carrot', meaning: '胡萝卜', phonetic: '/ˈkærət/', example: 'Rabbits like carrots.', exampleCn: '兔子喜欢胡萝卜。', options: ['胡萝卜', '土豆', '西红柿', '洋葱'], unit: 2 },
    { word: 'goose', meaning: '鹅', phonetic: '/ɡuːs/', example: 'The goose is on the farm.', exampleCn: '鹅在农场里。', options: ['鹅', '鸭子', '鸡', '鸟'], unit: 2 },
    { word: 'count', meaning: '数数', phonetic: '/kaʊnt/', example: 'Count from one to ten.', exampleCn: '从一数到十。', options: ['数数', '计算', '测量', '比较'], unit: 2 },
    { word: 'another', meaning: '另一个', phonetic: '/əˈnʌðə(r)/', example: 'I want another one.', exampleCn: '我想要另一个。', options: ['另一个', '相同的', '不同的', '特别的'], unit: 2 },
    { word: 'else', meaning: '其他的', phonetic: '/els/', example: 'What else do you need?', exampleCn: '你还需要什么？', options: ['其他的', '另外的', '相同的', '全部的'], unit: 2 },
    { word: 'circle', meaning: '圈出', phonetic: '/ˈsɜːkl/', example: 'Circle the correct answer.', exampleCn: '圈出正确答案。', options: ['圈出', '划掉', '写下', '读出'], unit: 2 },
    // Unit 1: You and Me (你和我)
    { word: 'full', meaning: '完整的', phonetic: '/fʊl/', example: 'Write your full name.', exampleCn: '写下你的全名。', options: ['完整的', '部分的', '空的', '简短的'], unit: 3 },
    { word: 'grade', meaning: '年级', phonetic: '/ɡreɪd/', example: 'I am in Grade 7.', exampleCn: '我在七年级。', options: ['年级', '班级', '学校', '分数'], unit: 3 },
    { word: 'classmate', meaning: '同班同学', phonetic: '/ˈklɑːsmeɪt/', example: 'She is my classmate.', exampleCn: '她是我的同班同学。', options: ['同班同学', '老师', '朋友', '邻居'], unit: 3 },
    { word: 'mistake', meaning: '错误', phonetic: '/mɪˈsteɪk/', example: 'Don\'t be afraid of mistakes.', exampleCn: '不要害怕犯错误。', options: ['错误', '成功', '挑战', '机会'], unit: 3 },
    { word: 'country', meaning: '国家', phonetic: '/ˈkʌntri/', example: 'China is a big country.', exampleCn: '中国是一个大国。', options: ['国家', '城市', '村庄', '岛屿'], unit: 3 },
    { word: 'same', meaning: '相同的', phonetic: '/seɪm/', example: 'We are in the same class.', exampleCn: '我们在同一个班。', options: ['相同的', '不同的', '相似的', '相反的'], unit: 3 },
    { word: 'twin', meaning: '双胞胎', phonetic: '/twɪn/', example: 'They are twin sisters.', exampleCn: '她们是双胞胎姐妹。', options: ['双胞胎', '兄弟', '姐妹', '朋友'], unit: 3 },
    { word: 'both', meaning: '两者都', phonetic: '/bəʊθ/', example: 'We both like music.', exampleCn: '我们俩都喜欢音乐。', options: ['两者都', '全部', '每个', '没有一个'], unit: 3 },
    { word: 'band', meaning: '乐队', phonetic: '/bænd/', example: 'He is in a rock band.', exampleCn: '他在一个摇滚乐队里。', options: ['乐队', '合唱团', '小组', '团队'], unit: 3 },
    { word: 'a lot', meaning: '非常', phonetic: '/ə lɒt/', example: 'Thanks a lot!', exampleCn: '非常感谢！', options: ['非常', '有点', '几乎', '几乎不'], unit: 3 },
    { word: 'tofu', meaning: '豆腐', phonetic: '/ˈtəʊfuː/', example: 'I like tofu.', exampleCn: '我喜欢豆腐。', options: ['豆腐', '面条', '米饭', '饺子'], unit: 3 },
    { word: 'parrot', meaning: '鹦鹉', phonetic: '/ˈpærət/', example: 'The parrot can talk.', exampleCn: '鹦鹉会说话。', options: ['鹦鹉', '鸽子', '麻雀', '老鹰'], unit: 3 },
    { word: 'guitar', meaning: '吉他', phonetic: '/ɡɪˈtɑː(r)/', example: 'He plays the guitar well.', exampleCn: '他吉他弹得很好。', options: ['吉他', '钢琴', '小提琴', '鼓'], unit: 3 },
    { word: 'information', meaning: '信息', phonetic: '/ˌɪnfəˈmeɪʃn/', example: 'Read the information.', exampleCn: '阅读信息。', options: ['信息', '知识', '新闻', '数据'], unit: 3 },
    { word: 'hobby', meaning: '爱好', phonetic: '/ˈhɒbi/', example: 'My hobby is reading.', exampleCn: '我的爱好是阅读。', options: ['爱好', '工作', '课程', '作业'], unit: 3 },
    // Unit 2: We're Family (家庭)
    { word: 'mean', meaning: '意思是', phonetic: '/miːn/', example: 'What does this word mean?', exampleCn: '这个词是什么意思？', options: ['意思是', '想要', '需要', '知道'], unit: 4 },
    { word: 'husband', meaning: '丈夫', phonetic: '/ˈhʌzbənd/', example: 'Her husband is a doctor.', exampleCn: '她的丈夫是一名医生。', options: ['丈夫', '妻子', '父亲', '兄弟'], unit: 4 },
    { word: 'together', meaning: '一起', phonetic: '/təˈɡeðə(r)/', example: 'We play together.', exampleCn: '我们一起玩。', options: ['一起', '分开', '单独', '轮流'], unit: 4 },
    { word: 'spend', meaning: '花费', phonetic: '/spend/', example: 'I spend time with family.', exampleCn: '我花时间和家人在一起。', options: ['花费', '节省', '浪费', '使用'], unit: 4 },
    { word: 'really', meaning: '非常', phonetic: '/ˈriːəli/', example: 'I really like it.', exampleCn: '我真的很喜欢它。', options: ['非常', '有点', '几乎', '几乎不'], unit: 4 },
    { word: 'member', meaning: '成员', phonetic: '/ˈmembə(r)/', example: 'She is a family member.', exampleCn: '她是家庭的一员。', options: ['成员', '领袖', '客人', '朋友'], unit: 4 },
    { word: 'activity', meaning: '活动', phonetic: '/ækˈtɪvəti/', example: 'We have many activities.', exampleCn: '我们有很多活动。', options: ['活动', '课程', '作业', '比赛'], unit: 4 },
    { word: 'chess', meaning: '国际象棋', phonetic: '/tʃes/', example: 'He likes playing chess.', exampleCn: '他喜欢下棋。', options: ['国际象棋', '围棋', '跳棋', '扑克'], unit: 4 },
    { word: 'grandparent', meaning: '祖父母', phonetic: '/ˈɡrænpeərənt/', example: 'My grandparents are kind.', exampleCn: '我的祖父母很和蔼。', options: ['祖父母', '父母', '亲戚', '邻居'], unit: 4 },
    { word: 'funny', meaning: '有趣的', phonetic: '/ˈfʌni/', example: 'He is a funny boy.', exampleCn: '他是一个有趣的男孩。', options: ['有趣的', '严肃的', '无聊的', '安静的'], unit: 4 },
    { word: 'laugh', meaning: '笑', phonetic: '/lɑːf/', example: 'We laugh together.', exampleCn: '我们一起笑。', options: ['笑', '哭', '喊', '唱'], unit: 4 },
    { word: 'different', meaning: '不同的', phonetic: '/ˈdɪfrənt/', example: 'We are different.', exampleCn: '我们是不同的。', options: ['不同的', '相同的', '相似的', '特别的'], unit: 4 },
    { word: 'violin', meaning: '小提琴', phonetic: '/ˌvaɪəˈlɪn/', example: 'She plays the violin.', exampleCn: '她拉小提琴。', options: ['小提琴', '吉他', '钢琴', '大提琴'], unit: 4 },
    { word: 'handsome', meaning: '英俊的', phonetic: '/ˈhænsəm/', example: 'He is tall and handsome.', exampleCn: '他又高又英俊。', options: ['英俊的', '美丽的', '可爱的', '聪明的'], unit: 4 },
    { word: 'son', meaning: '儿子', phonetic: '/sʌn/', example: 'They have a son.', exampleCn: '他们有一个儿子。', options: ['儿子', '女儿', '侄子', '孙子'], unit: 4 },
    { word: 'hike', meaning: '远足', phonetic: '/haɪk/', example: 'We go hiking on Sunday.', exampleCn: '我们周日去远足。', options: ['远足', '跑步', '游泳', '骑行'], unit: 4 },
    // Unit 3: My School (我的学校)
    { word: 'hall', meaning: '大厅', phonetic: '/hɔːl/', example: 'The hall is big.', exampleCn: '大厅很大。', options: ['大厅', '教室', '办公室', '图书馆'], unit: 5 },
    { word: 'building', meaning: '建筑物', phonetic: '/ˈbɪldɪŋ/', example: 'Our school has tall buildings.', exampleCn: '我们学校有高楼。', options: ['建筑物', '房间', '教室', '操场'], unit: 5 },
    { word: 'across', meaning: '穿过', phonetic: '/əˈkrɒs/', example: 'Walk across the street.', exampleCn: '穿过街道。', options: ['穿过', '沿着', '围绕', '经过'], unit: 5 },
    { word: 'centre', meaning: '中心', phonetic: '/ˈsentə(r)/', example: 'There is a library in the centre.', exampleCn: '中心有一个图书馆。', options: ['中心', '角落', '边缘', '外面'], unit: 5 },
    { word: 'gym', meaning: '体育馆', phonetic: '/dʒɪm/', example: 'We play basketball in the gym.', exampleCn: '我们在体育馆打篮球。', options: ['体育馆', '教室', '图书馆', '食堂'], unit: 5 },
    { word: 'field', meaning: '场地', phonetic: '/fiːld/', example: 'The sports field is large.', exampleCn: '运动场很大。', options: ['场地', '教室', '房间', '建筑'], unit: 5 },
    { word: 'office', meaning: '办公室', phonetic: '/ˈɒfɪs/', example: 'The teacher is in the office.', exampleCn: '老师在办公室。', options: ['办公室', '教室', '图书馆', '实验室'], unit: 5 },
    { word: 'large', meaning: '大的', phonetic: '/lɑːdʒ/', example: 'We have a large playground.', exampleCn: '我们有一个大操场。', options: ['大的', '小的', '高的', '矮的'], unit: 5 },
    { word: 'special', meaning: '特别的', phonetic: '/ˈspeʃl/', example: 'Today is a special day.', exampleCn: '今天是特别的一天。', options: ['特别的', '普通的', '重要的', '有趣的'], unit: 5 },
    { word: 'smart', meaning: '智能的', phonetic: '/smɑːt/', example: 'We use a smart board.', exampleCn: '我们使用智能白板。', options: ['智能的', '传统的', '简单的', '复杂的'], unit: 5 },
    { word: 'important', meaning: '重要的', phonetic: '/ɪmˈpɔːtnt/', example: 'English is important.', exampleCn: '英语很重要。', options: ['重要的', '有趣的', '困难的', '简单的'], unit: 5 },
    { word: 'notice', meaning: '通知', phonetic: '/ˈnəʊtɪs/', example: 'Read the notice on the board.', exampleCn: '阅读板上的通知。', options: ['通知', '作业', '考试', '新闻'], unit: 5 },
    { word: 'locker', meaning: '储物柜', phonetic: '/ˈlɒkə(r)/', example: 'Put your bag in the locker.', exampleCn: '把你的包放到储物柜里。', options: ['储物柜', '书桌', '书架', '抽屉'], unit: 5 },
    { word: 'bookcase', meaning: '书架', phonetic: '/ˈbʊkkeɪs/', example: 'Books are in the bookcase.', exampleCn: '书在书架上。', options: ['书架', '书桌', '书包', '抽屉'], unit: 5 },
    { word: 'modern', meaning: '现代的', phonetic: '/ˈmɒdn/', example: 'Our school is very modern.', exampleCn: '我们学校很现代。', options: ['现代的', '传统的', '古老的', '简单的'], unit: 5 },
    { word: 'amazing', meaning: '令人惊叹的', phonetic: '/əˈmeɪzɪŋ/', example: 'The view is amazing!', exampleCn: '风景令人惊叹！', options: ['令人惊叹的', '普通的', '无聊的', '糟糕的'], unit: 5 },
    { word: 'raise', meaning: '升起', phonetic: '/reɪz/', example: 'We raise the flag.', exampleCn: '我们升国旗。', options: ['升起', '放下', '举起', '放下'], unit: 5 },
    { word: 'flag', meaning: '旗帜', phonetic: '/flæɡ/', example: 'The national flag is red.', exampleCn: '国旗是红色的。', options: ['旗帜', '徽章', '符号', '标志'], unit: 5 },
    { word: 'change', meaning: '改变', phonetic: '/tʃeɪndʒ/', example: 'The school has changed.', exampleCn: '学校已经变了。', options: ['改变', '保持', '开始', '结束'], unit: 5 },
    { word: 'seat', meaning: '座位', phonetic: '/siːt/', example: 'Please take your seat.', exampleCn: '请就座。', options: ['座位', '桌子', '房间', '位置'], unit: 5 },
    { word: 'delicious', meaning: '美味的', phonetic: '/dɪˈlɪʃəs/', example: 'The food is delicious.', exampleCn: '食物很美味。', options: ['美味的', '健康的', '简单的', '特别的'], unit: 5 },
    { word: 'similar', meaning: '相似的', phonetic: '/ˈsɪmələ(r)/', example: 'Our schools are similar.', exampleCn: '我们的学校相似。', options: ['相似的', '不同的', '相同的', '相反的'], unit: 5 },
    // Unit 4: My Favourite Subject (我最喜欢的科目)
    { word: 'biology', meaning: '生物学', phonetic: '/baɪˈɒlədʒi/', example: 'We study biology in Grade 7.', exampleCn: '我们在七年级学生物。', options: ['生物学', '地理学', '历史学', '物理学'], unit: 6 },
    { word: 'geography', meaning: '地理', phonetic: '/dʒiˈɒɡrəfi/', example: 'I like geography class.', exampleCn: '我喜欢地理课。', options: ['地理', '历史', '生物', '化学'], unit: 6 },
    { word: 'history', meaning: '历史', phonetic: '/ˈhɪstri/', example: 'History is interesting.', exampleCn: '历史很有趣。', options: ['历史', '地理', '科学', '数学'], unit: 6 },
    { word: 'boring', meaning: '乏味的', phonetic: '/ˈbɔːrɪŋ/', example: 'Some lessons are boring.', exampleCn: '有些课很乏味。', options: ['乏味的', '有趣的', '令人兴奋的', '轻松的'], unit: 6 },
    { word: 'useful', meaning: '有用的', phonetic: '/ˈjuːsfl/', example: 'English is very useful.', exampleCn: '英语很有用。', options: ['有用的', '有趣的', '困难的', '重要的'], unit: 6 },
    { word: 'exciting', meaning: '令人激动的', phonetic: '/ɪkˈsaɪtɪŋ/', example: 'The news is exciting.', exampleCn: '这个消息令人激动。', options: ['令人激动的', '令人放松的', '令人疲惫的', '令人担忧的'], unit: 6 },
    { word: 'reason', meaning: '原因', phonetic: '/ˈriːzn/', example: 'Tell me the reason.', exampleCn: '告诉我原因。', options: ['原因', '结果', '方式', '时间'], unit: 6 },
    { word: 'remember', meaning: '记住', phonetic: '/rɪˈmembə(r)/', example: 'Remember the new words.', exampleCn: '记住生词。', options: ['记住', '忘记', '学习', '理解'], unit: 6 },
    { word: 'excellent', meaning: '优秀的', phonetic: '/ˈeksələnt/', example: 'You did an excellent job!', exampleCn: '你做得非常棒！', options: ['优秀的', '普通的', '良好的', '糟糕的'], unit: 6 },
    { word: 'instrument', meaning: '工具', phonetic: '/ˈɪnstrəmənt/', example: 'Music is fun with instruments.', exampleCn: '用乐器演奏音乐很有趣。', options: ['工具', '乐器', '设备', '机器'], unit: 6 },
    { word: 'future', meaning: '未来', phonetic: '/ˈfjuːtʃə(r)/', example: 'What do you want in the future?', exampleCn: '你未来想要什么？', options: ['未来', '过去', '现在', '永远'], unit: 6 },
    { word: 'problem', meaning: '难题', phonetic: '/ˈprɒbləm/', example: 'Let\'s solve the problem.', exampleCn: '让我们解决这个难题。', options: ['难题', '答案', '问题', '方法'], unit: 6 },
    { word: 'magic', meaning: '魔法', phonetic: '/ˈmædʒɪk/', example: 'The show has magic tricks.', exampleCn: '表演有魔术。', options: ['魔法', '科学', '游戏', '音乐'], unit: 6 },
    { word: 'life', meaning: '生活', phonetic: '/laɪf/', example: 'School life is wonderful.', exampleCn: '学校生活很精彩。', options: ['生活', '学习', '工作', '游戏'], unit: 6 },
    { word: 'scientist', meaning: '科学家', phonetic: '/ˈsaɪəntɪst/', example: 'I want to be a scientist.', exampleCn: '我想成为科学家。', options: ['科学家', '医生', '老师', '工程师'], unit: 6 },
    // Unit 5: Fun Clubs (有趣的社团)
    { word: 'club', meaning: '社团', phonetic: '/klʌb/', example: 'I join the music club.', exampleCn: '我加入音乐社团。', options: ['社团', '课程', '比赛', '活动'], unit: 7 },
    { word: 'join', meaning: '加入', phonetic: '/dʒɔɪn/', example: 'Come and join us!', exampleCn: '来加入我们吧！', options: ['加入', '离开', '开始', '结束'], unit: 7 },
    { word: 'choose', meaning: '选择', phonetic: '/tʃuːz/', example: 'Choose your favourite club.', exampleCn: '选择你最喜欢的社团。', options: ['选择', '加入', '参加', '放弃'], unit: 7 },
    { word: 'drama', meaning: '戏剧', phonetic: '/ˈdrɑːmə/', example: 'She likes drama club.', exampleCn: '她喜欢戏剧社。', options: ['戏剧', '音乐', '舞蹈', '绘画'], unit: 7 },
    { word: 'feeling', meaning: '感觉', phonetic: '/ˈfiːlɪŋ/', example: 'I have a good feeling.', exampleCn: '我有一种好的感觉。', options: ['感觉', '想法', '意见', '建议'], unit: 7 },
    { word: 'news', meaning: '新闻', phonetic: '/njuːz/', example: 'I watch the news every day.', exampleCn: '我每天看新闻。', options: ['新闻', '故事', '消息', '信息'], unit: 7 },
    { word: 'musical', meaning: '音乐的', phonetic: '/ˈmjuːzɪkl/', example: 'He has musical talent.', exampleCn: '他有音乐天赋。', options: ['音乐的', '艺术的', '体育的', '科学的'], unit: 7 },
    { word: 'exactly', meaning: '准确地', phonetic: '/ɪɡˈzæktli/', example: 'Tell me exactly what happened.', exampleCn: '准确地告诉我发生了什么。', options: ['准确地', '大致地', '快速地', '慢慢地'], unit: 7 },
    { word: 'drum', meaning: '鼓', phonetic: '/drʌm/', example: 'He plays the drums.', exampleCn: '他打鼓。', options: ['鼓', '吉他', '钢琴', '小提琴'], unit: 7 },
    { word: 'ability', meaning: '能力', phonetic: '/əˈbɪləti/', example: 'Everyone has different abilities.', exampleCn: '每个人都有不同的能力。', options: ['能力', '技能', '天赋', '知识'], unit: 7 },
    { word: 'paint', meaning: '绘画', phonetic: '/peɪnt/', example: 'I like to paint pictures.', exampleCn: '我喜欢画画。', options: ['绘画', '书写', '阅读', '唱歌'], unit: 7 },
    { word: 'climb', meaning: '攀登', phonetic: '/klaɪm/', example: 'We climb the mountain.', exampleCn: '我们爬山。', options: ['攀登', '跑步', '跳跃', '行走'], unit: 7 },
    { word: 'interested', meaning: '感兴趣的', phonetic: '/ˈɪntrəstɪd/', example: 'I am interested in science.', exampleCn: '我对科学感兴趣。', options: ['感兴趣的', '无聊的', '兴奋的', '担忧的'], unit: 7 },
    { word: 'nature', meaning: '自然', phonetic: '/ˈneɪtʃə(r)/', example: 'I love nature.', exampleCn: '我爱大自然。', options: ['自然', '城市', '乡村', '海洋'], unit: 7 },
    { word: 'collect', meaning: '收集', phonetic: '/kəˈlekt/', example: 'I collect stamps.', exampleCn: '我收集邮票。', options: ['收集', '丢弃', '分享', '交换'], unit: 7 },
    { word: 'insect', meaning: '昆虫', phonetic: '/ˈɪnsekt/', example: 'There are many insects.', exampleCn: '有很多昆虫。', options: ['昆虫', '动物', '植物', '鸟类'], unit: 7 },
    { word: 'discover', meaning: '发现', phonetic: '/dɪˈskʌvə(r)/', example: 'I discover new things.', exampleCn: '我发现新东西。', options: ['发现', '发明', '创造', '探索'], unit: 7 },
    { word: 'wildlife', meaning: '野生动物', phonetic: '/ˈwaɪldlaɪf/', example: 'We should protect wildlife.', exampleCn: '我们应该保护野生动物。', options: ['野生动物', '宠物', '家畜', '植物'], unit: 7 },
    // Unit 6: A Day in the Life (日常生活)
    { word: 'quarter', meaning: '一刻钟', phonetic: '/ˈkwɔːtə(r)/', example: 'It\'s a quarter past seven.', exampleCn: '七点一刻。', options: ['一刻钟', '半小时', '一小时', '十分钟'], unit: 8 },
    { word: 'shower', meaning: '淋浴', phonetic: '/ˈʃaʊə(r)/', example: 'I take a shower at 7.', exampleCn: '我七点淋浴。', options: ['淋浴', '洗澡', '游泳', '洗脸'], unit: 8 },
    { word: 'brush', meaning: '刷', phonetic: '/brʌʃ/', example: 'I brush my teeth.', exampleCn: '我刷牙。', options: ['刷', '洗', '梳', '擦'], unit: 8 },
    { word: 'duty', meaning: '值班', phonetic: '/ˈdjuːti/', example: 'Who is on duty today?', exampleCn: '今天谁值日？', options: ['值班', '工作', '任务', '责任'], unit: 8 },
    { word: 'usually', meaning: '通常', phonetic: '/ˈjuːʒuəli/', example: 'I usually get up at 6.', exampleCn: '我通常六点起床。', options: ['通常', '有时', '总是', '从不'], unit: 8 },
    { word: 'reporter', meaning: '记者', phonetic: '/rɪˈpɔːtə(r)/', example: 'She is a TV reporter.', exampleCn: '她是一名电视台记者。', options: ['记者', '作家', '编辑', '摄影师'], unit: 8 },
    { word: 'around', meaning: '大约', phonetic: '/əˈraʊnd/', example: 'I get up around 6.', exampleCn: '我大约六点起床。', options: ['大约', '正好', '总是', '有时'], unit: 8 },
    { word: 'homework', meaning: '家庭作业', phonetic: '/ˈhəʊmwɜːk/', example: 'I do homework after school.', exampleCn: '我放学后做作业。', options: ['家庭作业', '家务', '工作', '练习'], unit: 8 },
    { word: 'saying', meaning: '谚语', phonetic: '/ˈseɪɪŋ/', example: '"Early to bed" is a saying.', exampleCn: '"早睡"是一句谚语。', options: ['谚语', '故事', '诗歌', '歌曲'], unit: 8 },
    { word: 'rise', meaning: '起床', phonetic: '/raɪz/', example: 'I rise at 6 every day.', exampleCn: '我每天六点起床。', options: ['起床', '睡觉', '休息', '锻炼'], unit: 8 },
    { word: 'stay', meaning: '停留', phonetic: '/steɪ/', example: 'I stay at home today.', exampleCn: '我今天待在家里。', options: ['停留', '离开', '去', '来'], unit: 8 },
    { word: 'routine', meaning: '常规', phonetic: '/ruːˈtiːn/', example: 'This is my daily routine.', exampleCn: '这是我的日常。', options: ['常规', '习惯', '计划', '安排'], unit: 8 },
    { word: 'restaurant', meaning: '餐厅', phonetic: '/ˈrestrɒnt/', example: 'We eat at a restaurant.', exampleCn: '我们在餐厅吃饭。', options: ['餐厅', '食堂', '厨房', '超市'], unit: 8 },
    { word: 'housework', meaning: '家务', phonetic: '/ˈhaʊswɜːk/', example: 'I help with housework.', exampleCn: '我帮忙做家务。', options: ['家务', '家庭作业', '工作', '项目'], unit: 8 },
    { word: 'weekend', meaning: '周末', phonetic: '/ˌwiːkˈend/', example: 'I relax at the weekend.', exampleCn: '我周末休息。', options: ['周末', '工作日', '假期', '节日'], unit: 8 },
    { word: 'daily', meaning: '日常的', phonetic: '/ˈdeɪli/', example: 'This is my daily life.', exampleCn: '这是我的日常生活。', options: ['日常的', '每周的', '每月的', '每年的'], unit: 8 },
    { word: 'only', meaning: '仅仅', phonetic: '/ˈəʊnli/', example: 'I only have one sister.', exampleCn: '我只有一个妹妹。', options: ['仅仅', '总是', '经常', '从不'], unit: 8 },
    { word: 'break', meaning: '休息', phonetic: '/breɪk/', example: 'We have a break at 10.', exampleCn: '我们十点休息。', options: ['休息', '开始', '结束', '继续'], unit: 8 },
    { word: 'finish', meaning: '完成', phonetic: '/ˈfɪnɪʃ/', example: 'I finish homework at 8.', exampleCn: '我八点完成作业。', options: ['完成', '开始', '继续', '暂停'], unit: 8 },
    { word: 'already', meaning: '已经', phonetic: '/ɔːlˈredi/', example: 'I already finished it.', exampleCn: '我已经完成了。', options: ['已经', '刚刚', '将要', '曾经'], unit: 8 },
    { word: 'outside', meaning: '在外面', phonetic: '/ˌaʊtˈsaɪd/', example: 'We play outside.', exampleCn: '我们在外面玩。', options: ['在外面', '在里面', '在上面', '在下面'], unit: 8 },
    { word: 'part', meaning: '部分', phonetic: '/pɑːt/', example: 'Part of my day is reading.', exampleCn: '我一天中的一部分是阅读。', options: ['部分', '全部', '一半', '大多数'], unit: 8 },
    { word: 'prepare', meaning: '准备', phonetic: '/prɪˈpeə(r)/', example: 'I prepare for school.', exampleCn: '我为上学做准备。', options: ['准备', '开始', '完成', '计划'], unit: 8 },
    // Unit 7: Happy Birthday! (生日快乐)
    { word: 'celebrate', meaning: '庆祝', phonetic: '/ˈselɪbreɪt/', example: 'We celebrate birthdays.', exampleCn: '我们庆祝生日。', options: ['庆祝', '纪念', '感谢', '欢迎'], unit: 9 },
    { word: 'surprise', meaning: '惊喜', phonetic: '/səˈpraɪz/', example: 'What a nice surprise!', exampleCn: '多么好的惊喜！', options: ['惊喜', '惊讶', '快乐', '感动'], unit: 9 },
    { word: 'something', meaning: '某事', phonetic: '/ˈsʌmθɪŋ/', example: 'I have something for you.', exampleCn: '我有东西给你。', options: ['某事', '任何事', '每件事', '没有事'], unit: 9 },
    { word: 'sale', meaning: '出售', phonetic: '/seɪl/', example: 'The store has a sale.', exampleCn: '商店在打折。', options: ['出售', '购买', '价格', '优惠'], unit: 9 },
    { word: 'kilo', meaning: '千克', phonetic: '/ˈkiːləʊ/', example: 'I buy a kilo of apples.', exampleCn: '我买了一千克苹果。', options: ['千克', '克', '吨', '磅'], unit: 9 },
    { word: 'yogurt', meaning: '酸奶', phonetic: '/ˈjɒɡət/', example: 'I like yogurt for breakfast.', exampleCn: '我喜欢早餐喝酸奶。', options: ['酸奶', '牛奶', '果汁', '咖啡'], unit: 9 },
    { word: 'total', meaning: '总数', phonetic: '/ˈtəʊtl/', example: 'The total is 50 yuan.', exampleCn: '总共是50元。', options: ['总数', '价格', '数量', '金额'], unit: 9 },
    { word: 'price', meaning: '价格', phonetic: '/praɪs/', example: 'The price is low.', exampleCn: '价格很低。', options: ['价格', '价值', '费用', '成本'], unit: 9 },
    { word: 'balloon', meaning: '气球', phonetic: '/bəˈluːn/', example: 'The balloon is red.', exampleCn: '气球是红色的。', options: ['气球', '风筝', '彩带', '灯笼'], unit: 9 },
    { word: 'chocolate', meaning: '巧克力', phonetic: '/ˈtʃɒklət/', example: 'I love chocolate.', exampleCn: '我喜欢巧克力。', options: ['巧克力', '糖果', '蛋糕', '饼干'], unit: 9 },
    { word: 'pizza', meaning: '比萨饼', phonetic: '/ˈpiːtsə/', example: 'We have pizza for dinner.', exampleCn: '我们晚餐吃比萨。', options: ['比萨饼', '汉堡', '三明治', '面条'], unit: 9 },
    { word: 'list', meaning: '列表', phonetic: '/lɪst/', example: 'Make a shopping list.', exampleCn: '列一个购物清单。', options: ['列表', '笔记', '计划', '安排'], unit: 9 },
    { word: 'own', meaning: '自己的', phonetic: '/əʊn/', example: 'I have my own room.', exampleCn: '我有自己的房间。', options: ['自己的', '别人的', '公共的', '共享的'], unit: 9 },
    { word: 'example', meaning: '例子', phonetic: '/ɪɡˈzɑːmpl/', example: 'Give me an example.', exampleCn: '给我一个例子。', options: ['例子', '答案', '问题', '方法'], unit: 9 },
    { word: 'language', meaning: '语言', phonetic: '/ˈlæŋɡwɪdʒ/', example: 'English is a world language.', exampleCn: '英语是一门世界语言。', options: ['语言', '文化', '国家', '文字'], unit: 9 },
    { word: 'international', meaning: '国际的', phonetic: '/ˌɪntəˈnæʃnəl/', example: 'It is an international school.', exampleCn: '这是一所国际学校。', options: ['国际的', '国家的', '当地的', '外国的'], unit: 9 },
    { word: 'mark', meaning: '标记', phonetic: '/mɑːk/', example: 'Mark the important words.', exampleCn: '标记重要单词。', options: ['标记', '写下', '画出', '圈出'], unit: 9 },
    { word: 'national', meaning: '国家的', phonetic: '/ˈnæʃnəl/', example: 'The National Day is coming.', exampleCn: '国庆节快到了。', options: ['国家的', '国际的', '当地的', '民族的'], unit: 9 },
    { word: 'found', meaning: '创建', phonetic: '/faʊnd/', example: 'The school was founded in 2000.', exampleCn: '这所学校创建于2000年。', options: ['创建', '结束', '改变', '发现'], unit: 9 },
    { word: 'meaningful', meaning: '有意义的', phonetic: '/ˈmiːnɪŋfl/', example: 'It is a meaningful day.', exampleCn: '这是有意义的一天。', options: ['有意义的', '重要的', '特别的', '难忘的'], unit: 9 },
    { word: 'celebration', meaning: '庆典', phonetic: '/ˌselɪˈbreɪʃn/', example: 'We have a big celebration.', exampleCn: '我们有一个盛大的庆典。', options: ['庆典', '会议', '活动', '演出'], unit: 9 },
    { word: 'post', meaning: '发布', phonetic: '/pəʊst/', example: 'Post your ideas on the board.', exampleCn: '把你的想法发布到板上。', options: ['发布', '写下', '分享', '保存'], unit: 9 },
    { word: 'contact', meaning: '联系', phonetic: '/ˈkɒntækt/', example: 'Keep in contact with friends.', exampleCn: '和朋友保持联系。', options: ['联系', '见面', '通话', '写信'], unit: 9 },
    { word: 'symbol', meaning: '象征', phonetic: '/ˈsɪmbl/', example: 'Doves are a symbol of peace.', exampleCn: '鸽子是和平的象征。', options: ['象征', '标志', '图标', '记号'], unit: 9 },
    { word: 'village', meaning: '村庄', phonetic: '/ˈvɪlɪdʒ/', example: 'He lives in a small village.', exampleCn: '他住在一个小村庄。', options: ['村庄', '城市', '小镇', '郊区'], unit: 9 },
    { word: 'grow', meaning: '成长', phonetic: '/ɡrəʊ/', example: 'The plants grow fast.', exampleCn: '植物长得很快。', options: ['成长', '变化', '开始', '继续'], unit: 9 },
    { word: 'enjoy', meaning: '享受', phonetic: '/ɪnˈdʒɔɪ/', example: 'I enjoy reading books.', exampleCn: '我享受读书的乐趣。', options: ['享受', '喜欢', '热爱', '欣赏'], unit: 9 },
    { word: 'height', meaning: '身高', phonetic: '/haɪt/', example: 'My height is 150 cm.', exampleCn: '我的身高是150厘米。', options: ['身高', '体重', '年龄', '长度'], unit: 9 },
    { word: 'later', meaning: '以后', phonetic: '/ˈleɪtə(r)', example: 'See you later!', exampleCn: '待会儿见！', options: ['以后', '现在', '之前', '马上'], unit: 9 },
  ],
  8: [
    // 七年级下册 Unit 1
    { word: 'guitar', meaning: '吉他', phonetic: '/ɡɪˈtɑː/', example: 'This is a guitar.', exampleCn: '这是一个吉他。', options: ['吉他', '参加;加入', '故事;小说'], unit: 0 },
    { word: 'sing', meaning: '唱;唱歌', phonetic: '/sɪŋ/', example: 'I sing every weekend.', exampleCn: '我每周末唱歌。', options: ['唱;唱歌', '游泳', '画'], unit: 0 },
    { word: 'swim', meaning: '游泳', phonetic: '/swɪm/', example: 'I swim every weekend.', exampleCn: '我每周末游泳。', options: ['说英语', '游泳', '吉他'], unit: 0 },
    { word: 'dance', meaning: '跳舞', phonetic: '/dɑːns/', example: 'I dance every weekend.', exampleCn: '我每周末跳舞。', options: ['跳舞', '画', '敲鼓'], unit: 0 },
    { word: 'draw', meaning: '画', phonetic: '/drɔː/', example: 'I draw every weekend.', exampleCn: '我每周末画画。', options: ['画', '吉他', '唱歌'], unit: 0 },
    { word: 'chess', meaning: '国际象棋', phonetic: '/tʃes/', example: 'They play chess after class.', exampleCn: '他们课后下国际象棋。', options: ['国际象棋', '吉他', '钢琴'], unit: 0 },
    { word: 'speak', meaning: '说', phonetic: '/spiːk/', example: 'I can speak English.', exampleCn: '我会说英语。', options: ['说', '画', '游泳'], unit: 0 },
    { word: 'join', meaning: '参加', phonetic: '/dʒɔɪn/', example: 'I want to join the club.', exampleCn: '我想加入俱乐部。', options: ['参加', '教', '讲'], unit: 0 },
    { word: 'club', meaning: '俱乐部', phonetic: '/klʌb/', example: 'We have a music club.', exampleCn: '我们有一个音乐俱乐部。', options: ['俱乐部', '中心', '周末'], unit: 0 },
    { word: 'tell', meaning: '讲述', phonetic: '/tel/', example: 'Tell me a story.', exampleCn: '给我讲个故事。', options: ['讲述', '写', '画'], unit: 0 },
    { word: 'story', meaning: '故事', phonetic: '/ˈstɔːri/', example: 'I like this story.', exampleCn: '我喜欢这个故事。', options: ['故事', '作业', '音乐'], unit: 0 },
    { word: 'write', meaning: '写作', phonetic: '/raɪt/', example: 'I write every day.', exampleCn: '我每天写作。', options: ['写作', '讲述', '制作'], unit: 0 },
    { word: 'show', meaning: '展示', phonetic: '/ʃəʊ/', example: 'Show me your picture.', exampleCn: '给我看你的画。', options: ['展示', '告诉', '教'], unit: 0 },
    { word: 'talk', meaning: '说话', phonetic: '/tɔːk/', example: 'Don\'t talk in class.', exampleCn: '上课不要说话。', options: ['说话', '唱歌', '游泳'], unit: 0 },
    { word: 'piano', meaning: '钢琴', phonetic: '/pɪˈænəʊ/', example: 'She plays the piano well.', exampleCn: '她钢琴弹得好。', options: ['钢琴', '吉他', '鼓'], unit: 0 },
    { word: 'violin', meaning: '小提琴', phonetic: '/ˌvaɪəˈlɪn/', example: 'He plays the violin.', exampleCn: '他拉小提琴。', options: ['小提琴', '钢琴', '吉他'], unit: 0 },
    { word: 'drum', meaning: '鼓', phonetic: '/drʌm/', example: 'He plays the drum.', exampleCn: '他敲鼓。', options: ['鼓', '钢琴', '小提琴'], unit: 0 },
    { word: 'teach', meaning: '教', phonetic: '/tiːtʃ/', example: 'She teaches music.', exampleCn: '她教音乐。', options: ['教', '学习', '讲述'], unit: 0 },
    // 七年级下册 Unit 2
    { word: 'up', meaning: '向上', phonetic: '/ʌp/', example: 'Stand up, please.', exampleCn: '请起立。', options: ['向上', '向下', '向左'], unit: 1 },
    { word: 'dress', meaning: '穿衣服', phonetic: '/dres/', example: 'Get dressed quickly.', exampleCn: '快点穿好衣服。', options: ['穿衣服', '脱衣服', '洗衣服'], unit: 1 },
    { word: 'brush', meaning: '刷', phonetic: '/brʌʃ/', example: 'Brush your teeth.', exampleCn: '刷牙。', options: ['刷', '洗', '梳'], unit: 1 },
    { word: 'shower', meaning: '淋浴', phonetic: '/ˈʃaʊə/', example: 'Take a shower every day.', exampleCn: '每天洗淋浴。', options: ['淋浴', '洗澡', '游泳'], unit: 1 },
    { word: 'usually', meaning: '通常', phonetic: '/ˈjuːʒuəli/', example: 'I usually get up at 6.', exampleCn: '我通常六点起床。', options: ['通常', '有时', '从不'], unit: 1 },
    { word: 'never', meaning: '从不', phonetic: '/ˈnevə/', example: 'I never give up.', exampleCn: '我从不放弃。', options: ['从不', '总是', '有时'], unit: 1 },
    { word: 'early', meaning: '早', phonetic: '/ˈɜːli/', example: 'I get up early.', exampleCn: '我早起。', options: ['早', '晚', '快'], unit: 1 },
    { word: 'work', meaning: '工作', phonetic: '/wɜːk/', example: 'My father works hard.', exampleCn: '我爸爸工作努力。', options: ['工作', '学习', '休息'], unit: 1 },
    { word: 'funny', meaning: '有趣的', phonetic: '/ˈfʌni/', example: 'He is a funny boy.', exampleCn: '他是一个有趣的男孩。', options: ['有趣的', '严肃的', '安静的'], unit: 1 },
    { word: 'exercise', meaning: '锻炼', phonetic: '/ˈeksəsaɪz/', example: 'We exercise every morning.', exampleCn: '我们每天早上锻炼。', options: ['锻炼', '学习', '工作'], unit: 1 },
    { word: 'run', meaning: '跑', phonetic: '/rʌn/', example: 'I run every morning.', exampleCn: '我每天早上跑步。', options: ['跑', '走', '跳'], unit: 1 },
    { word: 'clean', meaning: '打扫', phonetic: '/kliːn/', example: 'Clean your room.', exampleCn: '打扫你的房间。', options: ['打扫', '整理', '清洗'], unit: 1 },
    { word: 'walk', meaning: '散步', phonetic: '/wɔːk/', example: 'Let\'s take a walk.', exampleCn: '我们去散步吧。', options: ['散步', '跑步', '游泳'], unit: 1 },
    { word: 'quickly', meaning: '很快地', phonetic: '/ˈkwɪkli/', example: 'He runs quickly.', exampleCn: '他跑得很快。', options: ['很快地', '慢慢地', '安静地'], unit: 1 },
    { word: 'life', meaning: '生活', phonetic: '/laɪf/', example: 'School life is fun.', exampleCn: '学校生活很有趣。', options: ['生活', '学习', '工作'], unit: 1 },
    { word: 'half', meaning: '一半', phonetic: '/hɑːf/', example: 'Half of the class is girls.', exampleCn: '班里一半是女生。', options: ['一半', '全部', '一些'], unit: 1 },
    // 七年级下册 Unit 3
    { word: 'train', meaning: '火车', phonetic: '/treɪn/', example: 'I go to Beijing by train.', exampleCn: '我坐火车去北京。', options: ['火车', '汽车', '地铁'], unit: 2 },
    { word: 'bus', meaning: '公共汽车', phonetic: '/bʌs/', example: 'Take the bus to school.', exampleCn: '坐公交去学校。', options: ['公共汽车', '火车', '地铁'], unit: 2 },
    { word: 'subway', meaning: '地铁', phonetic: '/ˈsʌbweɪ/', example: 'Take the subway.', exampleCn: '坐地铁。', options: ['地铁', '公交', '火车'], unit: 2 },
    { word: 'ride', meaning: '骑', phonetic: '/raɪd/', example: 'I ride a bike to school.', exampleCn: '我骑自行车上学。', options: ['骑', '开', '坐'], unit: 2 },
    { word: 'drive', meaning: '开车', phonetic: '/draɪv/', example: 'My dad drives to work.', exampleCn: '我爸爸开车上班。', options: ['开车', '骑车', '步行'], unit: 2 },
    { word: 'live', meaning: '居住', phonetic: '/lɪv/', example: 'I live in Beijing.', exampleCn: '我住在北京。', options: ['居住', '工作', '学习'], unit: 2 },
    { word: 'cross', meaning: '穿过', phonetic: '/krɔːs/', example: 'Cross the street carefully.', exampleCn: '小心过马路。', options: ['穿过', '沿着', '绕过'], unit: 2 },
    { word: 'river', meaning: '河流', phonetic: '/ˈrɪvə/', example: 'There is a river near here.', exampleCn: '这附近有一条河。', options: ['河流', '湖泊', '海洋'], unit: 2 },
    { word: 'bridge', meaning: '桥', phonetic: '/brɪdʒ/', example: 'Walk across the bridge.', exampleCn: '走过桥。', options: ['桥', '路', '河'], unit: 2 },
    { word: 'boat', meaning: '小船', phonetic: '/bəʊt/', example: 'We go by boat.', exampleCn: '我们坐船去。', options: ['小船', '火车', '汽车'], unit: 2 },
    { word: 'year', meaning: '年', phonetic: '/jɪə/', example: 'I am 13 years old.', exampleCn: '我13岁。', options: ['年', '月', '天'], unit: 2 },
    { word: 'afraid', meaning: '害怕', phonetic: '/əˈfreɪd/', example: 'Don\'t be afraid.', exampleCn: '不要害怕。', options: ['害怕', '勇敢', '开心'], unit: 2 },
    { word: 'dream', meaning: '梦想', phonetic: '/driːm/', example: 'Follow your dream.', exampleCn: '追逐你的梦想。', options: ['梦想', '目标', '计划'], unit: 2 },
    { word: 'true', meaning: '真的', phonetic: '/truː/', example: 'It is true.', exampleCn: '这是真的。', options: ['真的', '假的', '好的'], unit: 2 },
    { word: 'leave', meaning: '离开', phonetic: '/liːv/', example: 'Don\'t leave me.', exampleCn: '不要离开我。', options: ['离开', '留下', '到达'], unit: 2 },
    // 七年级下册 Unit 4
    { word: 'rule', meaning: '规则', phonetic: '/ruːl/', example: 'Follow the school rules.', exampleCn: '遵守校规。', options: ['规则', '纪律', '法律'], unit: 3 },
    { word: 'arrive', meaning: '到达', phonetic: '/əˈraɪv/', example: 'Arrive on time.', exampleCn: '准时到达。', options: ['到达', '离开', '出发'], unit: 3 },
    { word: 'listen', meaning: '听', phonetic: '/ˈlɪsn/', example: 'Listen to the teacher.', exampleCn: '听老师说。', options: ['听', '说', '读'], unit: 3 },
    { word: 'fight', meaning: '打架', phonetic: '/faɪt/', example: 'Don\'t fight with others.', exampleCn: '不要和别人打架。', options: ['打架', '争吵', '比赛'], unit: 3 },
    { word: 'sorry', meaning: '抱歉的', phonetic: '/ˈsɒri/', example: 'I am sorry.', exampleCn: '对不起。', options: ['抱歉的', '开心的', '生气的'], unit: 3 },
    { word: 'wear', meaning: '穿', phonetic: '/weə/', example: 'Wear your uniform.', exampleCn: '穿校服。', options: ['穿', '戴', '拿'], unit: 3 },
    { word: 'important', meaning: '重要的', phonetic: '/ɪmˈpɔːtənt/', example: 'This is very important.', exampleCn: '这非常重要。', options: ['重要的', '次要的', '简单的'], unit: 3 },
    { word: 'bring', meaning: '带来', phonetic: '/brɪŋ/', example: 'Bring your book.', exampleCn: '带上你的书。', options: ['带来', '拿走', '留下'], unit: 3 },
    { word: 'quiet', meaning: '安静的', phonetic: '/ˈkwaɪət/', example: 'Please be quiet.', exampleCn: '请安静。', options: ['安静的', '吵闹的', '开心的'], unit: 3 },
    { word: 'dirty', meaning: '脏的', phonetic: '/ˈdɜːti/', example: 'The room is dirty.', exampleCn: '房间脏了。', options: ['脏的', '干净的', '整洁的'], unit: 3 },
    { word: 'noisy', meaning: '吵闹的', phonetic: '/ˈnɔɪzi/', example: 'Don\'t be noisy.', exampleCn: '不要吵闹。', options: ['吵闹的', '安静的', '严肃的'], unit: 3 },
    { word: 'relax', meaning: '放松', phonetic: '/rɪˈlæks/', example: 'Relax and have fun.', exampleCn: '放松玩。', options: ['放松', '紧张', '学习'], unit: 3 },
    { word: 'read', meaning: '阅读', phonetic: '/riːd/', example: 'I like reading books.', exampleCn: '我喜欢读书。', options: ['阅读', '写作', '画画'], unit: 3 },
    { word: 'strict', meaning: '严格的', phonetic: '/strɪkt/', example: 'Our teacher is strict.', exampleCn: '我们老师很严格。', options: ['严格的', '宽容的', '友好的'], unit: 3 },
    { word: 'remember', meaning: '记住', phonetic: '/rɪˈmembə/', example: 'Remember the rules.', exampleCn: '记住规则。', options: ['记住', '忘记', '学习'], unit: 3 },
    { word: 'follow', meaning: '遵守', phonetic: '/ˈfɒləʊ/', example: 'Follow the rules.', exampleCn: '遵守规则。', options: ['遵守', '打破', '制定'], unit: 3 },
    { word: 'learn', meaning: '学习', phonetic: '/lɜːn/', example: 'Learn new things every day.', exampleCn: '每天学新东西。', options: ['学习', '教授', '练习'], unit: 3 },
    // 七年级下册 Unit 5
    { word: 'panda', meaning: '熊猫', phonetic: '/ˈpændə/', example: 'Pandas are very cute.', exampleCn: '熊猫很可爱。', options: ['熊猫', '老虎', '狮子'], unit: 4 },
    { word: 'tiger', meaning: '老虎', phonetic: '/ˈtaɪɡə/', example: 'Tigers are strong.', exampleCn: '老虎很强壮。', options: ['老虎', '狮子', '熊猫'], unit: 4 },
    { word: 'elephant', meaning: '大象', phonetic: '/ˈelɪfənt/', example: 'Elephants are big.', exampleCn: '大象很大。', options: ['大象', '长颈鹿', '熊猫'], unit: 4 },
    { word: 'lion', meaning: '狮子', phonetic: '/ˈlaɪən/', example: 'The lion is the king.', exampleCn: '狮子是百兽之王。', options: ['狮子', '老虎', '熊'], unit: 4 },
    { word: 'giraffe', meaning: '长颈鹿', phonetic: '/dʒɪˈrɑːf/', example: 'Giraffes have long necks.', exampleCn: '长颈鹿有长脖子。', options: ['长颈鹿', '大象', '熊猫'], unit: 4 },
    { word: 'animal', meaning: '动物', phonetic: '/ˈænɪməl/', example: 'I love animals.', exampleCn: '我爱动物。', options: ['动物', '植物', '人类'], unit: 4 },
    { word: 'cute', meaning: '可爱的', phonetic: '/kjuːt/', example: 'The cat is very cute.', exampleCn: '这只猫很可爱。', options: ['可爱的', '可怕的', '聪明的'], unit: 4 },
    { word: 'lazy', meaning: '懒惰的', phonetic: '/ˈleɪzi/', example: 'Don\'t be lazy.', exampleCn: '不要懒惰。', options: ['懒惰的', '勤奋的', '聪明的'], unit: 4 },
    { word: 'smart', meaning: '聪明的', phonetic: '/smɑːt/', example: 'He is a smart boy.', exampleCn: '他是个聪明的男孩。', options: ['聪明的', '可爱的', '懒惰的'], unit: 4 },
    { word: 'beautiful', meaning: '美丽的', phonetic: '/ˈbjuːtɪfəl/', example: 'What a beautiful flower!', exampleCn: '多美的花啊！', options: ['美丽的', '丑陋的', '可爱的'], unit: 4 },
    { word: 'scary', meaning: '吓人的', phonetic: '/ˈskeəri/', example: 'The movie is scary.', exampleCn: '这部电影很吓人。', options: ['吓人的', '有趣的', '无聊的'], unit: 4 },
    { word: 'save', meaning: '救', phonetic: '/seɪv/', example: 'Save the animals.', exampleCn: '拯救动物。', options: ['救', '杀', '养'], unit: 4 },
    { word: 'forget', meaning: '忘记', phonetic: '/fəˈɡet/', example: 'Don\'t forget your homework.', exampleCn: '别忘做作业。', options: ['忘记', '记住', '学习'], unit: 4 },
    { word: 'danger', meaning: '危险', phonetic: '/ˈdeɪndʒə/', example: 'Be careful of danger.', exampleCn: '小心危险。', options: ['危险', '安全', '困难'], unit: 4 },
    // 七年级下册 Unit 6
    { word: 'newspaper', meaning: '报纸', phonetic: '/ˈnjuːzpeɪpə/', example: 'Dad reads a newspaper.', exampleCn: '爸爸看报纸。', options: ['报纸', '杂志', '书籍'], unit: 5 },
    { word: 'use', meaning: '使用', phonetic: '/juːz/', example: 'Use your head.', exampleCn: '动动脑筋。', options: ['使用', '制作', '修理'], unit: 5 },
    { word: 'soup', meaning: '汤', phonetic: '/suːp/', example: 'I like chicken soup.', exampleCn: '我喜欢鸡汤。', options: ['汤', '面条', '米饭'], unit: 5 },
    { word: 'wash', meaning: '洗', phonetic: '/wɒʃ/', example: 'Wash your hands.', exampleCn: '洗手。', options: ['洗', '擦', '刷'], unit: 5 },
    { word: 'movie', meaning: '电影', phonetic: '/ˈmuːvi/', example: 'Let\'s watch a movie.', exampleCn: '我们看电影吧。', options: ['电影', '电视', '音乐'], unit: 5 },
    { word: 'drink', meaning: '喝', phonetic: '/drɪŋk/', example: 'Drink more water.', exampleCn: '多喝水。', options: ['喝', '吃', '咬'], unit: 5 },
    { word: 'tea', meaning: '茶', phonetic: '/tiː/', example: 'I like green tea.', exampleCn: '我喜欢绿茶。', options: ['茶', '咖啡', '果汁'], unit: 5 },
    { word: 'tomorrow', meaning: '明天', phonetic: '/təˈmɒrəʊ/', example: 'See you tomorrow.', exampleCn: '明天见。', options: ['明天', '今天', '昨天'], unit: 5 },
    { word: 'shop', meaning: '购物', phonetic: '/ʃɒp/', example: 'Let\'s go shopping.', exampleCn: '我们去购物吧。', options: ['购物', '游泳', '跑步'], unit: 5 },
    { word: 'supermarket', meaning: '超市', phonetic: '/ˈsuːpəmɑːkɪt/', example: 'Go to the supermarket.', exampleCn: '去超市。', options: ['超市', '商店', '市场'], unit: 5 },
    { word: 'miss', meaning: '想念', phonetic: '/mɪs/', example: 'I miss my family.', exampleCn: '我想念家人。', options: ['想念', '忘记', '找到'], unit: 5 },
    { word: 'wish', meaning: '希望', phonetic: '/wɪʃ/', example: 'I wish you luck.', exampleCn: '祝你好运。', options: ['希望', '想要', '需要'], unit: 5 },
    { word: 'delicious', meaning: '美味的', phonetic: '/dɪˈlɪʃəs/', example: 'The food is delicious.', exampleCn: '食物很美味。', options: ['美味的', '难吃的', '健康的'], unit: 5 },
    { word: 'still', meaning: '仍然', phonetic: '/stɪl/', example: 'I still remember.', exampleCn: '我仍然记得。', options: ['仍然', '已经', '从不'], unit: 5 },
    // 七年级下册 Unit 7
    { word: 'rain', meaning: '下雨', phonetic: '/reɪn/', example: 'It\'s raining outside.', exampleCn: '外面在下雨。', options: ['下雨', '下雪', '刮风'], unit: 6 },
    { word: 'windy', meaning: '多风的', phonetic: '/ˈwɪndi/', example: 'It is windy today.', exampleCn: '今天多风。', options: ['多风的', '多雨的', '多雪的'], unit: 6 },
    { word: 'cloudy', meaning: '多云的', phonetic: '/ˈklaʊdi/', example: 'It is cloudy.', exampleCn: '今天多云。', options: ['多云的', '晴朗的', '多雨的'], unit: 6 },
    { word: 'sunny', meaning: '晴朗的', phonetic: '/ˈsʌni/', example: 'It is sunny and warm.', exampleCn: '天气晴朗温暖。', options: ['晴朗的', '多云的', '多风的'], unit: 6 },
    { word: 'snow', meaning: '下雪', phonetic: '/snəʊ/', example: 'It snows in winter.', exampleCn: '冬天下雪。', options: ['下雪', '下雨', '结冰'], unit: 6 },
    { word: 'weather', meaning: '天气', phonetic: '/ˈweðə/', example: 'The weather is nice.', exampleCn: '天气很好。', options: ['天气', '气候', '季节'], unit: 6 },
    { word: 'cook', meaning: '做饭', phonetic: '/kʊk/', example: 'My mom cooks dinner.', exampleCn: '妈妈做晚饭。', options: ['做饭', '吃饭', '洗碗'], unit: 6 },
    { word: 'visit', meaning: '拜访', phonetic: '/ˈvɪzɪt/', example: 'Visit your grandparents.', exampleCn: '拜访祖父母。', options: ['拜访', '邀请', '欢迎'], unit: 6 },
    { word: 'summer', meaning: '夏天', phonetic: '/ˈsʌmə/', example: 'Summer is hot.', exampleCn: '夏天很热。', options: ['夏天', '冬天', '春天'], unit: 6 },
    { word: 'winter', meaning: '冬天', phonetic: '/ˈwɪntə/', example: 'Winter is cold.', exampleCn: '冬天很冷。', options: ['冬天', '夏天', '秋天'], unit: 6 },
    { word: 'mountain', meaning: '山', phonetic: '/ˈmaʊntɪn/', example: 'Climb the mountain.', exampleCn: '爬山。', options: ['山', '河', '湖'], unit: 6 },
    { word: 'vacation', meaning: '假期', phonetic: '/vəˈkeɪʃn/', example: 'Summer vacation is fun.', exampleCn: '暑假很有趣。', options: ['假期', '学期', '周末'], unit: 6 },
    { word: 'country', meaning: '国家', phonetic: '/ˈkʌntri/', example: 'China is a big country.', exampleCn: '中国是一个大国。', options: ['国家', '城市', '村庄'], unit: 6 },
    { word: 'skate', meaning: '滑冰', phonetic: '/skeɪt/', example: 'Let\'s go skating.', exampleCn: '我们去滑冰吧。', options: ['滑冰', '游泳', '跑步'], unit: 6 },
    // 七年级下册 Unit 8
    { word: 'post', meaning: '邮政', phonetic: '/pəʊst/', example: 'Go to the post office.', exampleCn: '去邮局。', options: ['邮政', '警察', '银行'], unit: 7 },
    { word: 'office', meaning: '办公室', phonetic: '/ˈɒfɪs/', example: 'The teacher is in the office.', exampleCn: '老师在办公室。', options: ['办公室', '教室', '图书馆'], unit: 7 },
    { word: 'police', meaning: '警察', phonetic: '/pəˈliːs/', example: 'Call the police.', exampleCn: '报警。', options: ['警察', '医生', '老师'], unit: 7 },
    { word: 'hotel', meaning: '酒店', phonetic: '/həʊˈtel/', example: 'Stay at a hotel.', exampleCn: '住酒店。', options: ['酒店', '医院', '银行'], unit: 7 },
    { word: 'restaurant', meaning: '餐馆', phonetic: '/ˈrestrɒnt/', example: 'Eat at a restaurant.', exampleCn: '在餐馆吃饭。', options: ['餐馆', '超市', '商店'], unit: 7 },
    { word: 'bank', meaning: '银行', phonetic: '/bæŋk/', example: 'Put money in the bank.', exampleCn: '把钱存银行。', options: ['银行', '邮局', '警局'], unit: 7 },
    { word: 'hospital', meaning: '医院', phonetic: '/ˈhɒspɪtl/', example: 'Go to the hospital.', exampleCn: '去医院。', options: ['医院', '诊所', '药店'], unit: 7 },
    { word: 'street', meaning: '街道', phonetic: '/striːt/', example: 'Walk along the street.', exampleCn: '沿着街道走。', options: ['街道', '马路', '小巷'], unit: 7 },
    { word: 'near', meaning: '附近', phonetic: '/nɪə/', example: 'The school is near here.', exampleCn: '学校在附近。', options: ['附近', '远处', '对面'], unit: 7 },
    { word: 'across', meaning: '穿过', phonetic: '/əˈkrɒs/', example: 'Walk across the street.', exampleCn: '穿过街道。', options: ['穿过', '沿着', '绕过'], unit: 7 },
    { word: 'turn', meaning: '转向', phonetic: '/tɜːn/', example: 'Turn left at the corner.', exampleCn: '在拐角左转。', options: ['转向', '直走', '后退'], unit: 7 },
    { word: 'spend', meaning: '花费', phonetic: '/spend/', example: 'Spend time with family.', exampleCn: '花时间和家人在一起。', options: ['花费', '节省', '浪费'], unit: 7 },
    { word: 'climb', meaning: '爬', phonetic: '/klaɪm/', example: 'Climb the tree.', exampleCn: '爬树。', options: ['爬', '跳', '跑'], unit: 7 },
    { word: 'enjoy', meaning: '享受', phonetic: '/ɪnˈdʒɔɪ/', example: 'Enjoy your meal!', exampleCn: '享受你的美食！', options: ['享受', '喜欢', '热爱'], unit: 7 },
    { word: 'free', meaning: '免费的', phonetic: '/friː/', example: 'The book is free.', exampleCn: '这本书是免费的。', options: ['免费的', '昂贵的', '便宜的'], unit: 7 },
    // 七年级下册 Unit 9
    { word: 'curly', meaning: '卷曲的', phonetic: '/ˈkɜːli/', example: 'She has curly hair.', exampleCn: '她有一头卷发。', options: ['卷曲的', '直的', '长的'], unit: 8 },
    { word: 'straight', meaning: '直的', phonetic: '/streɪt/', example: 'He has straight hair.', exampleCn: '他有一头直发。', options: ['直的', '卷曲的', '短的'], unit: 8 },
    { word: 'tall', meaning: '高的', phonetic: '/tɔːl/', example: 'He is tall and thin.', exampleCn: '他又高又瘦。', options: ['高的', '矮的', '胖的'], unit: 8 },
    { word: 'thin', meaning: '瘦的', phonetic: '/θɪn/', example: 'She is very thin.', exampleCn: '她很瘦。', options: ['瘦的', '胖的', '壮的'], unit: 8 },
    { word: 'heavy', meaning: '重的', phonetic: '/ˈhevi/', example: 'The box is heavy.', exampleCn: '箱子很重。', options: ['重的', '轻的', '大的'], unit: 8 },
    { word: 'height', meaning: '身高', phonetic: '/haɪt/', example: 'What is your height?', exampleCn: '你多高？', options: ['身高', '体重', '年龄'], unit: 8 },
    { word: 'later', meaning: '以后', phonetic: '/ˈleɪtə/', example: 'See you later.', exampleCn: '再见。', options: ['以后', '现在', '之前'], unit: 8 },
    { word: 'handsome', meaning: '英俊的', phonetic: '/ˈhænsəm/', example: 'He is handsome.', exampleCn: '他很英俊。', options: ['英俊的', '美丽的', '可爱的'], unit: 8 },
    { word: 'actor', meaning: '演员', phonetic: '/ˈæktə/', example: 'He is a famous actor.', exampleCn: '他是著名演员。', options: ['演员', '歌手', '舞者'], unit: 8 },
    { word: 'person', meaning: '人', phonetic: '/ˈpɜːsn/', example: 'She is a nice person.', exampleCn: '她是个好人。', options: ['人', '动物', '植物'], unit: 8 },
    { word: 'singer', meaning: '歌手', phonetic: '/ˈsɪŋə/', example: 'She is a great singer.', exampleCn: '她是伟大的歌手。', options: ['歌手', '演员', '画家'], unit: 8 },
    { word: 'artist', meaning: '艺术家', phonetic: '/ˈɑːtɪst/', example: 'He is a great artist.', exampleCn: '他是伟大的艺术家。', options: ['艺术家', '歌手', '舞者'], unit: 8 },
    { word: 'describe', meaning: '描述', phonetic: '/dɪˈskraɪb/', example: 'Describe the picture.', exampleCn: '描述这幅画。', options: ['描述', '画', '写'], unit: 8 },
    { word: 'another', meaning: '另一个', phonetic: '/əˈnʌðə/', example: 'I want another one.', exampleCn: '我想要另一个。', options: ['另一个', '这一个', '那个'], unit: 8 },
    // 七年级下册 Unit 10
    { word: 'noodle', meaning: '面条', phonetic: '/ˈnuːdl/', example: 'I like noodles.', exampleCn: '我喜欢面条。', options: ['面条', '米饭', '面包'], unit: 9 },
    { word: 'mutton', meaning: '羊肉', phonetic: '/ˈmʌtn/', example: 'Mutton soup is good.', exampleCn: '羊肉汤很好喝。', options: ['羊肉', '牛肉', '猪肉'], unit: 9 },
    { word: 'beef', meaning: '牛肉', phonetic: '/biːf/', example: 'I like beef noodles.', exampleCn: '我喜欢牛肉面。', options: ['牛肉', '羊肉', '鸡肉'], unit: 9 },
    { word: 'cabbage', meaning: '卷心菜', phonetic: '/ˈkæbɪdʒ/', example: 'Cabbage is healthy.', exampleCn: '卷心菜很健康。', options: ['卷心菜', '土豆', '洋葱'], unit: 9 },
    { word: 'potato', meaning: '土豆', phonetic: '/pəˈteɪtəʊ/', example: 'I like potatoes.', exampleCn: '我喜欢土豆。', options: ['土豆', '卷心菜', '胡萝卜'], unit: 9 },
    { word: 'special', meaning: '特色的', phonetic: '/ˈspeʃl/', example: 'Today\'s special is fish.', exampleCn: '今日特色是鱼。', options: ['特色的', '普通的', '特别的'], unit: 9 },
    { word: 'order', meaning: '点菜', phonetic: '/ˈɔːdə/', example: 'May I take your order?', exampleCn: '可以点菜了吗？', options: ['点菜', '做饭', '上菜'], unit: 9 },
    { word: 'size', meaning: '大小', phonetic: '/saɪz/', example: 'What size would you like?', exampleCn: '你想要什么尺寸？', options: ['大小', '口味', '种类'], unit: 9 },
    { word: 'bowl', meaning: '碗', phonetic: '/bəʊl/', example: 'A bowl of rice, please.', exampleCn: '请来一碗米饭。', options: ['碗', '盘子', '杯子'], unit: 9 },
    { word: 'meat', meaning: '肉', phonetic: '/miːt/', example: 'Eat more meat.', exampleCn: '多吃肉。', options: ['肉', '蔬菜', '水果'], unit: 9 },
    { word: 'dumpling', meaning: '饺子', phonetic: '/ˈdʌmplɪŋ/', example: 'I like dumplings.', exampleCn: '我喜欢饺子。', options: ['饺子', '包子', '馒头'], unit: 9 },
    { word: 'fish', meaning: '鱼', phonetic: '/fɪʃ/', example: 'Fish is delicious.', exampleCn: '鱼很好吃。', options: ['鱼', '肉', '虾'], unit: 9 },
    { word: 'cake', meaning: '蛋糕', phonetic: '/keɪk/', example: 'Happy birthday! Here is a cake.', exampleCn: '生日快乐！给你蛋糕。', options: ['蛋糕', '面包', '饼干'], unit: 9 },
    { word: 'candle', meaning: '蜡烛', phonetic: '/ˈkændl/', example: 'Blow out the candles.', exampleCn: '吹灭蜡烛。', options: ['蜡烛', '灯', '火'], unit: 9 },
    { word: 'lucky', meaning: '幸运的', phonetic: '/ˈlʌki/', example: 'You are lucky!', exampleCn: '你真幸运！', options: ['幸运的', '快乐的', '悲伤的'], unit: 9 },
    { word: 'popular', meaning: '流行的', phonetic: '/ˈpɒpjələ/', example: 'This song is popular.', exampleCn: '这首歌很流行。', options: ['流行的', '经典的', '传统的'], unit: 9 },
    { word: 'idea', meaning: '主意', phonetic: '/aɪˈdɪə/', example: 'Good idea!', exampleCn: '好主意！', options: ['主意', '计划', '梦想'], unit: 9 },
    // 七年级下册 Unit 11
    { word: 'milk', meaning: '挤奶', phonetic: '/mɪlk/', example: 'Milk a cow.', exampleCn: '给奶牛挤奶。', options: ['挤奶', '喂鸡', '骑马'], unit: 10 },
    { word: 'cow', meaning: '奶牛', phonetic: '/kaʊ/', example: 'The cow gives milk.', exampleCn: '奶牛产奶。', options: ['奶牛', '马', '羊'], unit: 10 },
    { word: 'horse', meaning: '马', phonetic: '/hɔːs/', example: 'Ride a horse.', exampleCn: '骑马。', options: ['马', '牛', '驴'], unit: 10 },
    { word: 'farmer', meaning: '农民', phonetic: '/ˈfɑːmə/', example: 'The farmer works on the farm.', exampleCn: '农民在农场工作。', options: ['农民', '工人', '老师'], unit: 10 },
    { word: 'quite', meaning: '相当', phonetic: '/kwaɪt/', example: 'It is quite good.', exampleCn: '这相当好。', options: ['相当', '非常', '有点'], unit: 10 },
    { word: 'grow', meaning: '种植', phonetic: '/ɡrəʊ/', example: 'Grow some flowers.', exampleCn: '种些花。', options: ['种植', '采摘', '浇水'], unit: 10 },
    { word: 'farm', meaning: '农场', phonetic: '/fɑːm/', example: 'We visit a farm.', exampleCn: '我们参观农场。', options: ['农场', '工厂', '学校'], unit: 10 },
    { word: 'pick', meaning: '采摘', phonetic: '/pɪk/', example: 'Pick some apples.', exampleCn: '摘一些苹果。', options: ['采摘', '种植', '浇水'], unit: 10 },
    { word: 'excellent', meaning: '极好的', phonetic: '/ˈeksələnt/', example: 'Excellent work!', exampleCn: '做得极好！', options: ['极好的', '好的', '差的'], unit: 10 },
    { word: 'worry', meaning: '担心', phonetic: '/ˈwʌri/', example: 'Don\'t worry.', exampleCn: '不要担心。', options: ['担心', '放心', '开心'], unit: 10 },
    { word: 'yesterday', meaning: '昨天', phonetic: '/ˈjestədeɪ/', example: 'I was busy yesterday.', exampleCn: '我昨天很忙。', options: ['昨天', '今天', '明天'], unit: 10 },
    { word: 'flower', meaning: '花', phonetic: '/ˈflaʊə/', example: 'The flowers are beautiful.', exampleCn: '花很漂亮。', options: ['花', '草', '树'], unit: 10 },
    { word: 'sun', meaning: '太阳', phonetic: '/sʌn/', example: 'The sun is bright.', exampleCn: '太阳很亮。', options: ['太阳', '月亮', '星星'], unit: 10 },
    { word: 'museum', meaning: '博物馆', phonetic: '/mjuːˈziːəm/', example: 'Go to the museum.', exampleCn: '去博物馆。', options: ['博物馆', '图书馆', '公园'], unit: 10 },
    { word: 'exciting', meaning: '令人兴奋的', phonetic: '/ɪkˈsaɪtɪŋ/', example: 'The trip is exciting.', exampleCn: '这次旅行令人兴奋。', options: ['令人兴奋的', '无聊的', '有趣的'], unit: 10 },
    { word: 'expensive', meaning: '昂贵的', phonetic: '/ɪkˈspensɪv/', example: 'The car is expensive.', exampleCn: '这车很贵。', options: ['昂贵的', '便宜的', '免费的'], unit: 10 },
    { word: 'cheap', meaning: '便宜的', phonetic: '/tʃiːp/', example: 'The book is cheap.', exampleCn: '这本书很便宜。', options: ['便宜的', '昂贵的', '免费的'], unit: 10 },
    { word: 'robot', meaning: '机器人', phonetic: '/ˈrəʊbɒt/', example: 'Robots can help us.', exampleCn: '机器人可以帮助我们。', options: ['机器人', '电脑', '手机'], unit: 10 },
    // 七年级下册 Unit 12
    { word: 'camp', meaning: '露营', phonetic: '/kæmp/', example: 'Go camping this weekend.', exampleCn: '这周末去露营。', options: ['露营', '钓鱼', '远足'], unit: 11 },
    { word: 'lake', meaning: '湖', phonetic: '/leɪk/', example: 'The lake is beautiful.', exampleCn: '湖很美。', options: ['湖', '河', '海'], unit: 11 },
    { word: 'beach', meaning: '海滩', phonetic: '/biːtʃ/', example: 'Go to the beach.', exampleCn: '去海滩。', options: ['海滩', '湖边', '山'], unit: 11 },
    { word: 'sheep', meaning: '羊', phonetic: '/ʃiːp/', example: 'The sheep are cute.', exampleCn: '羊很可爱。', options: ['羊', '牛', '猪'], unit: 11 },
    { word: 'natural', meaning: '自然的', phonetic: '/ˈnætʃərəl/', example: 'Nature is beautiful.', exampleCn: '大自然是美的。', options: ['自然的', '人工的', '奇妙的'], unit: 11 },
    { word: 'visitor', meaning: '游客', phonetic: '/ˈvɪzɪtə/', example: 'Many visitors come here.', exampleCn: '很多游客来这里。', options: ['游客', '居民', '学生'], unit: 11 },
    { word: 'tired', meaning: '疲倦的', phonetic: '/ˈtaɪəd/', example: 'I am very tired.', exampleCn: '我很累。', options: ['疲倦的', '兴奋的', '无聊的'], unit: 11 },
    { word: 'stay', meaning: '停留', phonetic: '/steɪ/', example: 'Stay at home.', exampleCn: '待在家里。', options: ['停留', '离开', '出发'], unit: 11 },
    { word: 'away', meaning: '离开', phonetic: '/əˈweɪ/', example: 'Go away!', exampleCn: '走开！', options: ['离开', '靠近', '回来'], unit: 11 },
    { word: 'shout', meaning: '喊叫', phonetic: '/ʃaʊt/', example: 'Don\'t shout!', exampleCn: '不要喊叫！', options: ['喊叫', '低语', '唱歌'], unit: 11 },
    { word: 'language', meaning: '语言', phonetic: '/ˈlæŋɡwɪdʒ/', example: 'English is a useful language.', exampleCn: '英语是有用的语言。', options: ['语言', '文字', '符号'], unit: 11 },
    { word: 'kite', meaning: '风筝', phonetic: '/kaɪt/', example: 'Fly a kite.', exampleCn: '放风筝。', options: ['风筝', '飞机', '气球'], unit: 11 },
    { word: 'high', meaning: '高的', phonetic: '/haɪ/', example: 'The mountain is high.', exampleCn: '山很高。', options: ['高的', '低的', '远的'], unit: 11 },
    { word: 'ago', meaning: '以前', phonetic: '/əˈɡəʊ/', example: 'I saw him two days ago.', exampleCn: '我两天前见过他。', options: ['以前', '以后', '现在'], unit: 11 },
    { word: 'tent', meaning: '帐篷', phonetic: '/tent/', example: 'Put up a tent.', exampleCn: '搭帐篷。', options: ['帐篷', '房子', '小屋'], unit: 11 },
    { word: 'moon', meaning: '月亮', phonetic: '/muːn/', example: 'The moon is bright.', exampleCn: '月亮很亮。', options: ['月亮', '太阳', '星星'], unit: 11 },
    { word: 'snake', meaning: '蛇', phonetic: '/sneɪk/', example: 'Be careful of snakes.', exampleCn: '小心蛇。', options: ['蛇', '老鼠', '鸟'], unit: 11 },
    { word: 'move', meaning: '移动', phonetic: '/muːv/', example: 'Move your chair.', exampleCn: '移动你的椅子。', options: ['移动', '停止', '坐下'], unit: 11 },
    { word: 'jump', meaning: '跳', phonetic: '/dʒʌmp/', example: 'Jump up and down.', exampleCn: '上下跳。', options: ['跳', '跑', '走'], unit: 11 },
    { word: 'start', meaning: '开始', phonetic: '/stɑːt/', example: 'Start the game.', exampleCn: '开始游戏。', options: ['开始', '结束', '暂停'], unit: 11 },
    { word: 'forest', meaning: '森林', phonetic: '/ˈfɒrɪst/', example: 'Walk in the forest.', exampleCn: '在森林里走。', options: ['森林', '沙漠', '草原'], unit: 11 },
    { word: 'ear', meaning: '耳朵', phonetic: '/ɪə/', example: 'The rabbit has long ears.', exampleCn: '兔子有长耳朵。', options: ['耳朵', '眼睛', '鼻子'], unit: 11 },
  ],
  9: [
    { word: 'ancient', meaning: '古代的；古老的', phonetic: '/ˈeɪnʃənt/', example: '', exampleCn: '', options: ['古代的；古老的', '手风琴', '战斗；搏斗；斗争', '胜利；成功'], unit: 0 },
    { word: 'camp', meaning: '度假营；营地', phonetic: '/kæmp/', example: '', exampleCn: '', options: ['护照', '胜利；成功', '奇怪的；陌生的', '度假营；营地'], unit: 0 },
    { word: 'landscape', meaning: '风景；景色', phonetic: '/ˈlændskeɪp/', example: '', exampleCn: '', options: ['奇怪的；陌生的', '可能；可以', '风景；景色', '在……期间'], unit: 0 },
    { word: 'strange', meaning: '奇怪的；陌生的', phonetic: '/streɪndʒ/', example: '', exampleCn: '', options: ['虹；彩虹', '惊奇的；惊讶的', '奇怪的；陌生的', '围巾；披巾'], unit: 0 },
    { word: 'vacation', meaning: '假期；度假', phonetic: '/vəˈkeɪʃn/', example: '', exampleCn: '', options: ['车站；所；局', '使人舒服的；舒适的', '在某处；到某处', '假期；度假'], unit: 0 },
    { word: 'fantastic', meaning: '极好的；吸引人的', phonetic: '/fænˈtæstɪk/', example: '', exampleCn: '', options: ['极好的；吸引人的', '忘记', '丝绸；（蚕）丝', '乡村；农村'], unit: 0 },
    { word: 'town', meaning: '镇；商业区', phonetic: '/taʊn/', example: '', exampleCn: '', options: ['忘记', '镇；商业区', '丝绸；（蚕）丝', '风景；景色'], unit: 0 },
    { word: 'breath', meaning: '呼吸的空气；一口气', phonetic: '/breθ/', example: '', exampleCn: '', options: ['镇；商业区', '俄罗斯的', '虹；彩虹', '呼吸的空气；一口气'], unit: 0 },
    { word: 'anywhere', meaning: '在任何地方', phonetic: '/ˈeniweə(r)/', example: '', exampleCn: '', options: ['在任何地方', '艺术作品；插图', '在某处；到某处', '风景；景色'], unit: 0 },
    { word: 'nothing', meaning: '没有事；没有任何东西', phonetic: '/ˈnʌθɪŋ/', example: '', exampleCn: '', options: ['旅馆；旅社', '没有事；没有任何东西', '在……期间', '可能；可以'], unit: 0 },
    { word: 'guide', meaning: '导游；指南；手册', phonetic: '/ɡaɪd/', example: '', exampleCn: '', options: ['导游；指南；手册', '恶心的；生病的', '艺术作品；插图', '广场；正方形'], unit: 0 },
    { word: 'scenery', meaning: '风景；景色', phonetic: '/ˈsiːnəri/', example: '', exampleCn: '', options: ['围巾；披巾', '我自己', '鹿', '风景；景色'], unit: 0 },
    { word: 'silk', meaning: '丝绸；（蚕）丝', phonetic: '/sɪlk/', example: '', exampleCn: '', options: ['提醒；使想起', '丝绸；（蚕）丝', '护照', '反对；与……相反；紧靠'], unit: 0 },
    { word: 'scarf', meaning: '围巾；披巾', phonetic: '/skɑːf/', example: '', exampleCn: '', options: ['手风琴', '向；朝', '围巾；披巾', '度假营；营地'], unit: 0 },
    { word: 'ready', meaning: '准备好的；现成的', phonetic: '/ˈredi/', example: '', exampleCn: '', options: ['准备好的；现成的', '眼泪；泪水', '乡村；农村', '远方的；遥远的'], unit: 0 },
    { word: 'somewhere', meaning: '在某处；到某处', phonetic: '/ˈsʌmweə(r)/', example: '', exampleCn: '', options: ['镇；商业区', '在某处；到某处', '度假营；营地', '战斗；搏斗；斗争'], unit: 0 },
    { word: 'myself', meaning: '我自己', phonetic: '/maɪˈself/', example: '', exampleCn: '', options: ['使人舒服的；舒适的', '我自己', '镇；商业区', '古代的；古老的'], unit: 0 },
    { word: 'hotel', meaning: '旅馆；旅社', phonetic: '/həʊˈtel/', example: '', exampleCn: '', options: ['惊奇的；惊讶的', '厌倦的；烦闷的', '可能；可以', '旅馆；旅社'], unit: 0 },
    { word: 'comfortable', meaning: '使人舒服的；舒适的', phonetic: '/ˈkʌmftəbl/', example: '', exampleCn: '', options: ['很可能；大概', '使人舒服的；舒适的', '古代的；古老的', '眼泪；泪水'], unit: 0 },
    { word: 'bored', meaning: '厌倦的；烦闷的', phonetic: '/bɔːd/', example: '', exampleCn: '', options: ['手风琴', '厌倦的；烦闷的', '在某处；到某处', '使人舒服的；舒适的'], unit: 0 },
    { word: 'sky', meaning: '天；天空', phonetic: '/skaɪ/', example: '', exampleCn: '', options: ['我自己', '正午；中午', '虹；彩虹', '天；天空'], unit: 0 },
    { word: 'towards', meaning: '向；朝', phonetic: '/təˈwɔːdz/', example: '', exampleCn: '', options: ['很可能；大概', '向；朝', '俄罗斯的', '恶心的；生病的'], unit: 0 },
    { word: 'rainbow', meaning: '虹；彩虹', phonetic: '/ˈreɪnbəʊ/', example: '', exampleCn: '', options: ['虹；彩虹', '天；天空', '惊奇的；惊讶的', '旅馆；旅社'], unit: 0 },
    { word: 'square', meaning: '广场；正方形', phonetic: '/skweə(r)/', example: '', exampleCn: '', options: ['向；朝', '旅馆；旅社', '平常的；有规律的', '广场；正方形'], unit: 0 },
    { word: 'during', meaning: '在……期间', phonetic: '/ˈdjʊərɪŋ/', example: '', exampleCn: '', options: ['手风琴', '王宫；宫殿', '反对；与……相反；紧靠', '在……期间'], unit: 0 },
    { word: 'victory', meaning: '胜利；成功', phonetic: '/ˈvɪktəri/', example: '', exampleCn: '', options: ['厌倦的；烦闷的', '胜利；成功', '我自己', '准备好的；现成的'], unit: 0 },
    { word: 'Russian', meaning: '俄罗斯的', phonetic: '/ˈrʌʃn/', example: '', exampleCn: '', options: ['平常的；有规律的', '护照', '俄罗斯的', '王宫；宫殿'], unit: 0 },
    { word: 'fight', meaning: '战斗；搏斗；斗争', phonetic: '/faɪt/', example: '', exampleCn: '', options: ['战斗；搏斗；斗争', '王宫；宫殿', '可能；可以', '恶心的；生病的'], unit: 0 },
    { word: 'against', meaning: '反对；与……相反', phonetic: '/əˈɡenst/', example: '', exampleCn: '', options: ['度假营；营地', '预算', '在……期间', '反对；与……相反'], unit: 0 },
    { word: 'artwork', meaning: '艺术作品；插图', phonetic: '/ˈɑːtwɜːk/', example: '', exampleCn: '', options: ['艺术作品；插图', '我自己', '旅馆；旅社', '呼吸的空气；一口气'], unit: 0 },
    { word: 'tear', meaning: '眼泪；泪水', phonetic: '/tɪə(r)/', example: '', exampleCn: '', options: ['恶心的；生病的', '眼泪；泪水', '在……期间', '车站；所；局'], unit: 0 },
    { word: 'remind', meaning: '提醒；使想起', phonetic: '/rɪˈmaɪnd/', example: '', exampleCn: '', options: ['提醒；使想起', '艺术作品；插图', '远方的；遥远的', '惊奇的；惊讶的'], unit: 0 },
    { word: 'peace', meaning: '和平；太平', phonetic: '/piːs/', example: '', exampleCn: '', options: ['旅馆；旅社', '和平；太平', '呼吸的空气；一口气', '地下铁道系统'], unit: 0 },
    { word: 'easily', meaning: '容易地；轻易地', phonetic: '/ˈiːzəli/', example: '', exampleCn: '', options: ['度假营；营地', '艺术作品；插图', '正午；中午', '容易地；轻易地'], unit: 0 },
    { word: 'forget', meaning: '忘记；遗忘', phonetic: '/fəˈɡet/', example: '', exampleCn: '', options: ['忘记；遗忘', '度假营；营地', '奇怪的；陌生的', '厌倦的；烦闷的'], unit: 0 },
    { word: 'noon', meaning: '正午；中午', phonetic: '/nuːn/', example: '', exampleCn: '', options: ['虹；彩虹', '正午；中午', '古代的；古老的', '奇怪的；陌生的'], unit: 0 },
    { word: 'sick', meaning: '恶心的；生病的', phonetic: '/sɪk/', example: '', exampleCn: '', options: ['呼吸的空气；一口气', '胜利；成功', '可能；可以', '恶心的；生病的'], unit: 0 },
    { word: 'metro', meaning: '地下铁道系统', phonetic: '/ˈmetrəʊ/', example: '', exampleCn: '', options: ['丝绸；（蚕）丝', '风景；景色', '容易地；轻易地', '地下铁道系统'], unit: 0 },
    { word: 'station', meaning: '车站；所；局', phonetic: '/ˈsteɪʃn/', example: '', exampleCn: '', options: ['旅馆；旅社', '呼吸的空气；一口气', '车站；所；局', '没有事；没有任何东西'], unit: 0 },
    { word: 'palace', meaning: '王宫；宫殿', phonetic: '/ˈpæləs/', example: '', exampleCn: '', options: ['提醒；使想起', '没有事；没有任何东西', '在某处；到某处', '王宫；宫殿'], unit: 0 },
    { word: 'accordion', meaning: '手风琴', phonetic: '/əˈkɔːdiən/', example: '', exampleCn: '', options: ['风景；景色', '手风琴', '平常的；有规律的', '没有事；没有任何东西'], unit: 0 },
    { word: 'tower', meaning: '塔；塔楼', phonetic: '/ˈtaʊə(r)/', example: '', exampleCn: '', options: ['战斗；搏斗；斗争', '在任何地方', '容易地；轻易地', '塔；塔楼'], unit: 0 },
    { word: 'might', meaning: '可能；可以', phonetic: '/maɪt/', example: '', exampleCn: '', options: ['厌倦的；烦闷的', '我自己', '可能；可以', '乡村；农村'], unit: 0 },
    { word: 'budget', meaning: '预算', phonetic: '/ˈbʌdʒɪt/', example: '', exampleCn: '', options: ['忘记；遗忘', '鹿', '预算', '在某处；到某处'], unit: 0 },
    { word: 'passport', meaning: '护照', phonetic: '/ˈpɑːspɔːt/', example: '', exampleCn: '', options: ['可能；可以', '预算', '没有事；没有任何东西', '护照'], unit: 0 },
    { word: 'forgetful', meaning: '健忘的', phonetic: '/fəˈɡetfl/', example: '', exampleCn: '', options: ['恶心的；生病的', '健忘的', '远方的；遥远的', '在某处；到某处'], unit: 0 },
    { word: 'faraway', meaning: '远方的；遥远的', phonetic: '/ˈfɑːrəweɪ/', example: '', exampleCn: '', options: ['车站；所；局', '远方的；遥远的', '惊奇的；惊讶的', '使人舒服的；舒适的'], unit: 0 },
    { word: 'regular', meaning: '平常的；有规律的', phonetic: '/ˈreɡjələ(r)/', example: '', exampleCn: '', options: ['我自己', '地下铁道系统', '假期；度假', '平常的；有规律的'], unit: 0 },
    { word: 'countryside', meaning: '乡村；农村', phonetic: '/ˈkʌntrisaɪd/', example: '', exampleCn: '', options: ['我自己', '乡村；农村', '提醒；使想起', '手风琴'], unit: 0 },
    { word: 'surprised', meaning: '惊奇的；惊讶的', phonetic: '/səˈpraɪzd/', example: '', exampleCn: '', options: ['王宫；宫殿', '惊奇的；惊讶的', '正午；中午', '奇怪的；陌生的'], unit: 0 },
    { word: 'deer', meaning: '鹿', phonetic: '/dɪə(r)/', example: '', exampleCn: '', options: ['容易地；轻易地', '鹿', '准备好的；现成的', '在……期间'], unit: 0 },
    { word: 'probably', meaning: '很可能；大概', phonetic: '/ˈprɒbəbli/', example: '', exampleCn: '', options: ['地下铁道系统', '奇怪的；陌生的', '古代的；古老的', '很可能；大概'], unit: 0 },
    /* Unit 2 */
    { word: 'pack', meaning: '打包；收拾', phonetic: '/pæk/', example: '', exampleCn: '', options: ['阳台', '打包；收拾', '还', '到达'], unit: 1 },
    { word: 'bathroom', meaning: '浴室；洗手间', phonetic: '/ˈbɑːθruːm/', example: '', exampleCn: '', options: ['打包；收拾', '还', '添加；加', '浴室；洗手间'], unit: 1 },
    { word: 'sort', meaning: '把……分类；整理', phonetic: '/sɔːt/', example: '', exampleCn: '', options: ['添加；加', '到达', '打包；收拾', '把……分类；整理'], unit: 1 },
    { word: 'bedroom', meaning: '卧室', phonetic: '/ˈbedruːm/', example: '', exampleCn: '', options: ['卧室', '浴室；洗手间', '借', '阳台'], unit: 1 },
    { word: 'balcony', meaning: '阳台', phonetic: '/ˈbælkəni/', example: '', exampleCn: '', options: ['打包；收拾', '浴室；洗手间', '到达', '阳台'], unit: 1 },
    { word: 'invite', meaning: '邀请', phonetic: '/ɪnˈvaɪt/', example: '', exampleCn: '', options: ['借', '饼干', '邀请', '把……分类；整理'], unit: 1 },
    { word: 'arrival', meaning: '到达', phonetic: '/əˈraɪvl/', example: '', exampleCn: '', options: ['把……分类；整理', '到达', '邀请', '卧室'], unit: 1 },
    { word: 'yet', meaning: '还', phonetic: '/jet/', example: '', exampleCn: '', options: ['邀请', '还', '打包；收拾', '添加；加'], unit: 1 },
    { word: 'add', meaning: '添加；加', phonetic: '/æd/', example: '', exampleCn: '', options: ['把……分类；整理', '到达', '添加；加', '饼干'], unit: 1 },
    { word: 'biscuit', meaning: '饼干', phonetic: '/ˈbɪskɪt/', example: '', exampleCn: '', options: ['阳台', '添加；加', '到达', '饼干'], unit: 1 },
    { word: 'borrow', meaning: '借', phonetic: '/ˈbɒrəʊ/', example: '', exampleCn: '', options: ['浴室；洗手间', '打包；收拾', '借', '到达'], unit: 1 },
    /* Unit 2 continued */
    { word: 'plan', meaning: '策划；打算', phonetic: '/plæn/', example: '', exampleCn: '', options: ['策划；打算', '作者', '描述；形容', '啊'], unit: 1 },
    { word: 'treasure', meaning: '宝物；财富', phonetic: '/ˈtreʒə(r)/', example: '', exampleCn: '', options: ['宝物；财富', '剪刀', '比较；对比', '装饰；装潢'], unit: 1 },
    { word: 'hunt', meaning: '搜寻；狩猎', phonetic: '/hʌnt/', example: '', exampleCn: '', options: ['搜寻；狩猎', '拉；拖；拽', '无论去哪里', '社区；社团'], unit: 1 },
    { word: 'lift', meaning: '搭便车；电梯', phonetic: '/lɪft/', example: '', exampleCn: '', options: ['描述；形容', '差不多；几乎', '搭便车；电梯', '笔记；记录'], unit: 1 },
    { word: 'until', meaning: '到……时；直到……为止', phonetic: '/ənˈtɪl/', example: '', exampleCn: '', options: ['刚刚', '旅行；历程', '剪纸', '到……时；直到……为止'], unit: 1 },
    { word: 'movie', meaning: '电影', phonetic: '/ˈmuːvi/', example: '', exampleCn: '', options: ['描述；形容', '喜悦；乐趣', '电影', '盘子；碟子'], unit: 1 },
    { word: 'dead', meaning: '不运行的；死的', phonetic: '/ded/', example: '', exampleCn: '', options: ['也许；可能', '发臭；闻到', '不运行的；死的', '策划；打算'], unit: 1 },
    { word: 'note', meaning: '笔记；记录', phonetic: '/nəʊt/', example: '', exampleCn: '', options: ['笔记；记录', '遮盖；包括', '发臭；闻到', '刚刚'], unit: 1 },
    { word: 'community', meaning: '社区；社团', phonetic: '/kəˈmjuːnəti/', example: '', exampleCn: '', options: ['社区；社团', '发臭；闻到', '差不多；几乎', '作者'], unit: 1 },
    { word: 'rubbish', meaning: '垃圾', phonetic: '/ˈrʌbɪʃ/', example: '', exampleCn: '', options: ['房间；公寓套房', '啊', '差不多；几乎', '垃圾'], unit: 1 },
    { word: 'almost', meaning: '差不多；几乎', phonetic: '/ˈɔːlməʊst/', example: '', exampleCn: '', options: ['差不多；几乎', '遮盖；包括', '正文；文本', '垃圾'], unit: 1 },
    { word: 'journey', meaning: '旅行；历程', phonetic: '/ˈdʒɜːni/', example: '', exampleCn: '', options: ['搜寻；狩猎', '宝物；财富', '旅行；历程', '大楼；街区'], unit: 1 },
    { word: 'pull', meaning: '拉；拖；拽', phonetic: '/pʊl/', example: '', exampleCn: '', options: ['策划；打算', '拉；拖；拽', '胶水', '无论去哪里'], unit: 1 },
    { word: 'luggage', meaning: '行李', phonetic: '/ˈlʌɡɪdʒ/', example: '', exampleCn: '', options: ['也许；可能', '行李', '旅行；历程', '胶水'], unit: 1 },
    { word: 'ah', meaning: '啊', phonetic: '/ɑː/', example: '', exampleCn: '', options: ['差不多；几乎', '盘子；碟子', '啊', '遮盖；包括'], unit: 1 },
    { word: 'familiar', meaning: '熟悉的', phonetic: '/fəˈmɪliə(r)/', example: '', exampleCn: '', options: ['遮盖；包括', '海报', '几个；一些', '熟悉的'], unit: 1 },
    { word: 'joke', meaning: '笑话', phonetic: '/dʒəʊk/', example: '', exampleCn: '', options: ['差不多；几乎', '刚刚', '笑话', '喜悦；乐趣'], unit: 1 },
    { word: 'several', meaning: '几个；一些', phonetic: '/ˈsevrəl/', example: '', exampleCn: '', options: ['不运行的；死的', '笔记；记录', '几个；一些', '差不多；几乎'], unit: 1 },
    { word: 'nod', meaning: '点头', phonetic: '/nɒd/', example: '', exampleCn: '', options: ['搭便车；电梯', '拉；拖；拽', '不运行的；死的', '点头'], unit: 1 },
    { word: 'writer', meaning: '作者', phonetic: '/ˈraɪtə(r)/', example: '', exampleCn: '', options: ['作者', '描述；形容', '笑话', '搜寻；狩猎'], unit: 1 },
    { word: 'text', meaning: '正文；文本', phonetic: '/tekst/', example: '', exampleCn: '', options: ['遮盖；包括', '搜寻；狩猎', '社区；社团', '正文；文本'], unit: 1 },
    { word: 'describe', meaning: '描述；形容', phonetic: '/dɪˈskraɪb/', example: '', exampleCn: '', options: ['描述；形容', '剪纸', '啊', '差不多；几乎'], unit: 1 },
    { word: 'wherever', meaning: '无论去哪里', phonetic: '/weərˈevə(r)/', example: '', exampleCn: '', options: ['无论去哪里', '遮盖；包括', '拉；拖；拽', '笑话'], unit: 1 },
    { word: 'matter', meaning: '要紧；问题', phonetic: '/ˈmætə(r)/', example: '', exampleCn: '', options: ['拉；拖；拽', '大楼；街区', '胶水', '要紧；问题'], unit: 1 },
    { word: 'perhaps', meaning: '也许；可能', phonetic: '/pəˈhæps/', example: '', exampleCn: '', options: ['啊', '搭便车；电梯', '也许；可能', '大楼；街区'], unit: 1 },
    { word: 'plate', meaning: '盘子；碟子', phonetic: '/pleɪt/', example: '', exampleCn: '', options: ['剪纸', '社区；社团', '盘子；碟子', '也许；可能'], unit: 1 },
    { word: 'freshly', meaning: '刚刚', phonetic: '/ˈfreʃli/', example: '', exampleCn: '', options: ['不运行的；死的', '剪纸', '点头', '刚刚'], unit: 1 },
    { word: 'smell', meaning: '发臭；闻到', phonetic: '/smel/', example: '', exampleCn: '', options: ['发臭；闻到', '房间；公寓套房', '剪纸', '宝物；财富'], unit: 1 },
    { word: 'joy', meaning: '喜悦；乐趣', phonetic: '/dʒɔɪ/', example: '', exampleCn: '', options: ['比较；对比', '熟悉的', '社区；社团', '喜悦；乐趣'], unit: 1 },
    { word: 'apartment', meaning: '房间；公寓套房', phonetic: '/əˈpɑːtmənt/', example: '', exampleCn: '', options: ['熟悉的', '点头', '房间；公寓套房', '几个；一些'], unit: 1 },
    { word: 'block', meaning: '大楼；街区', phonetic: '/blɒk/', example: '', exampleCn: '', options: ['大楼；街区', '社区；社团', '发臭；闻到', '电影'], unit: 1 },
    { word: 'decorate', meaning: '装饰；装潢', phonetic: '/ˈdekəreɪt/', example: '', exampleCn: '', options: ['无论去哪里', '刚刚', '正文；文本', '装饰；装潢'], unit: 1 },
    { word: 'cover', meaning: '遮盖；包括', phonetic: '/ˈkʌvə(r)/', example: '', exampleCn: '', options: ['发臭；闻到', '笔记；记录', '遮盖；包括', '到……时；直到……为止'], unit: 1 },
    { word: 'poster', meaning: '海报', phonetic: '/ˈpəʊstə(r)/', example: '', exampleCn: '', options: ['发臭；闻到', '笔记；记录', '几个；一些', '海报'], unit: 1 },
    { word: 'scissors', meaning: '剪刀', phonetic: '/ˈsɪzəz/', example: '', exampleCn: '', options: ['剪刀', '社区；社团', '点头', '笔记；记录'], unit: 1 },
    { word: 'glue', meaning: '胶水', phonetic: '/ɡluː/', example: '', exampleCn: '', options: ['搭便车；电梯', '胶水', '旅行；历程', '笔记；记录'], unit: 1 },
    { word: 'paper-cut', meaning: '剪纸', phonetic: '/ˈpeɪpə(r)kʌt/', example: '', exampleCn: '', options: ['旅行；历程', '垃圾', '喜悦；乐趣', '剪纸'], unit: 1 },
    /* Unit 3 */
    { word: 'compare', meaning: '比较；对比', phonetic: '/kəmˈpeə(r)/', example: '', exampleCn: '', options: ['差不多；几乎', '社区；社团', '海报', '比较；对比'], unit: 2 },
    { word: 'shy', meaning: '害羞的', phonetic: '/ʃaɪ/', example: '', exampleCn: '', options: ['王子', '相似之处', '害羞的', '较少的；更少的'], unit: 2 },
    { word: 'lazy', meaning: '懒惰的', phonetic: '/ˈleɪzi/', example: '', exampleCn: '', options: ['友谊；友情', '懒惰的', '每', '空闲的；备用的'], unit: 2 },
    { word: 'loud', meaning: '响亮地；大声的', phonetic: '/laʊd/', example: '', exampleCn: '', options: ['解决；解答', '响亮地；大声的', '较少的；更少的', '降雨量'], unit: 2 },
    { word: 'outgoing', meaning: '外向的', phonetic: '/ˌaʊtˈɡəʊɪŋ/', example: '', exampleCn: '', options: ['外向的', '祝贺；恭喜', '坦率的；简单的', '镜子'], unit: 2 },
    { word: 'hard-working', meaning: '勤奋的', phonetic: '/ˌhɑːd ˈwɜːkɪŋ/', example: '', exampleCn: '', options: ['勤奋的', '表演；执行', '懒惰的', '人口'], unit: 2 },
    { word: 'perform', meaning: '表演；执行', phonetic: '/pəˈfɔːm/', example: '', exampleCn: '', options: ['长笛', '相似之处', '表演；执行', '幽默；幽默感'], unit: 2 },
    { word: 'alone', meaning: '独自；单独', phonetic: '/əˈləʊn/', example: '', exampleCn: '', options: ['小说', '祝贺；恭喜', '勤奋的', '独自；单独'], unit: 2 },
    { word: 'solve', meaning: '解决；解答', phonetic: '/sɒlv/', example: '', exampleCn: '', options: ['较少的；更少的', '解决；解答', '率直的；直接的', '奖；奖励'], unit: 2 },
    { word: 'flute', meaning: '长笛', phonetic: '/fluːt/', example: '', exampleCn: '', options: ['长笛', '交换', '外向的', '参加；出席'], unit: 2 },
    { word: 'congratulation', meaning: '祝贺；恭喜', phonetic: '/kənˌɡrætʃəˈleɪʃn/', example: '', exampleCn: '', options: ['祝贺；恭喜', '相像的', '解决；解答', '看法；意见'], unit: 2 },
    { word: 'prize', meaning: '奖；奖励', phonetic: '/praɪz/', example: '', exampleCn: '', options: ['奖；奖励', '独自；单独', '小说', '祝贺；恭喜'], unit: 2 },
    { word: 'attend', meaning: '参加；出席', phonetic: '/əˈtend/', example: '', exampleCn: '', options: ['解决；解答', '除……之外', '害羞的', '参加；出席'], unit: 2 },
    { word: 'besides', meaning: '除……之外', phonetic: '/bɪˈsaɪdz/', example: '', exampleCn: '', options: ['相似之处', '除……之外', '降雨量', '严肃的；严重的'], unit: 2 },
    { word: 'spare', meaning: '空闲的；备用的', phonetic: '/speə(r)/', example: '', exampleCn: '', options: ['理解力；感觉', '坦率的；简单的', '差异', '空闲的；备用的'], unit: 2 },
    { word: 'pleasure', meaning: '乐事；愉快；荣幸', phonetic: '/ˈpleʒə(r)/', example: '', exampleCn: '', options: ['友谊；友情', '乐事；愉快；荣幸', '害羞的', '幽默；幽默感'], unit: 2 },
    { word: 'appearance', meaning: '外表；露面', phonetic: '/əˈpɪərəns/', example: '', exampleCn: '', options: ['宜人的；友好的', '外表；露面', '相似之处', '乐事；愉快；荣幸'], unit: 2 },
    { word: 'personality', meaning: '性格；品质', phonetic: '/ˌpɜːsəˈnæləti/', example: '', exampleCn: '', options: ['性格；品质', '优势；力量', '友谊；友情', '害羞的'], unit: 2 },
    { word: 'serious', meaning: '严肃的；严重的', phonetic: '/ˈsɪəriəs/', example: '', exampleCn: '', options: ['长笛', '事实；现实', '米', '严肃的；严重的'], unit: 2 },
    { word: 'strength', meaning: '优势；力量', phonetic: '/streŋθ/', example: '', exampleCn: '', options: ['外向的', '表演；执行', '优势；力量', '响亮地；大声的'], unit: 2 },
    { word: 'slim', meaning: '苗条的；薄的', phonetic: '/slɪm/', example: '', exampleCn: '', options: ['长笛', '苗条的；薄的', '奖；奖励', '性格；品质'], unit: 2 },
    { word: 'fact', meaning: '事实；现实', phonetic: '/fækt/', example: '', exampleCn: '', options: ['奖；奖励', '除……之外', '事实；现实', '幽默；幽默感'], unit: 2 },
    { word: 'population', meaning: '人口', phonetic: '/ˌpɒpjuˈleɪʃn/', example: '', exampleCn: '', options: ['镜子', '人口', '空闲的；备用的', '乐事；愉快；荣幸'], unit: 2 },
    { word: 'average', meaning: '平均的', phonetic: '/ˈævərɪdʒ/', example: '', exampleCn: '', options: ['祝贺；恭喜', '严肃的；严重的', '平均的', '独自；单独'], unit: 2 },
    { word: 'rainfall', meaning: '降雨量', phonetic: '/ˈreɪnfɔːl/', example: '', exampleCn: '', options: ['理解力；感觉', '降雨量', '懒惰的', '率直的；直接的'], unit: 2 },
    { word: 'per', meaning: '每', phonetic: '/pə(r)/', example: '', exampleCn: '', options: ['人口', '每', '性格；品质', '率直的；直接的'], unit: 2 },
    { word: 'pleasant', meaning: '宜人的；友好的', phonetic: '/ˈpleznt/', example: '', exampleCn: '', options: ['性格；品质', '苗条的；薄的', '宜人的；友好的', '幽默；幽默感'], unit: 2 },
    { word: 'difference', meaning: '差异', phonetic: '/ˈdɪfrəns/', example: '', exampleCn: '', options: ['差异', '优势；力量', '业余爱好；兴趣', '祝贺；恭喜'], unit: 2 },
    { word: 'alike', meaning: '相像的', phonetic: '/əˈlaɪk/', example: '', exampleCn: '', options: ['长笛', '看法；意见', '勤奋的', '相像的'], unit: 2 },
    { word: 'mirror', meaning: '镜子', phonetic: '/ˈmɪrə(r)/', example: '', exampleCn: '', options: ['镜子', '外向的', '交换', '幽默；幽默感'], unit: 2 },
    { word: 'interest', meaning: '业余爱好；兴趣', phonetic: '/ˈɪntrəst/', example: '', exampleCn: '', options: ['较少的；更少的', '严肃的；严重的', '业余爱好；兴趣', '镜子'], unit: 2 },
    { word: 'novel', meaning: '小说', phonetic: '/ˈnɒvl/', example: '', exampleCn: '', options: ['相似之处', '事实；现实', '小说', '严肃的；严重的'], unit: 2 },
    { word: 'sense', meaning: '理解力；感觉', phonetic: '/sens/', example: '', exampleCn: '', options: ['镜子', '理解力；感觉', '祝贺；恭喜', '事实；现实'], unit: 2 },
    { word: 'humour', meaning: '幽默；幽默感', phonetic: '/ˈhjuːmə(r)/', example: '', exampleCn: '', options: ['幽默；幽默感', '相似之处', '奖；奖励', '镜子'], unit: 2 },
    { word: 'opinion', meaning: '看法；意见', phonetic: '/əˈpɪnjən/', example: '', exampleCn: '', options: ['差异', '业余爱好；兴趣', '看法；意见', '空闲的；备用的'], unit: 2 },
    { word: 'less', meaning: '较少的；更少的', phonetic: '/les/', example: '', exampleCn: '', options: ['理解力；感觉', '较少的；更少的', '严肃的；严重的', '表演；执行'], unit: 2 },
    { word: 'straightforward', meaning: '坦率的；简单的', phonetic: '/ˌstreɪtˈfɔːwəd/', example: '', exampleCn: '', options: ['米', '镜子', '坦率的；简单的', '理解力；感觉'], unit: 2 },
    { word: 'honest', meaning: '坦诚的；诚实的', phonetic: '/ˈɒnɪst/', example: '', exampleCn: '', options: ['理解力；感觉', '坦诚的；诚实的', '优势；力量', '相像的'], unit: 2 },
    { word: 'direct', meaning: '率直的；直接的', phonetic: '/dəˈrekt/', example: '', exampleCn: '', options: ['率直的；直接的', '平均的', '米', '表演；执行'], unit: 2 },
    { word: 'similarity', meaning: '相似之处', phonetic: '/ˌsɪməˈlærəti/', example: '', exampleCn: '', options: ['幽默；幽默感', '小说', '相似之处', '每'], unit: 2 },
    { word: 'friendship', meaning: '友谊；友情', phonetic: '/ˈfrendʃɪp/', example: '', exampleCn: '', options: ['每', '降雨量', '独自；单独', '友谊；友情'], unit: 2 },
    { word: 'metre', meaning: '米', phonetic: '/ˈmiːtə(r)/', example: '', exampleCn: '', options: ['空闲的；备用的', '懒惰的', '米', '乐事；愉快；荣幸'], unit: 2 },
    { word: 'prince', meaning: '王子', phonetic: '/prɪns/', example: '', exampleCn: '', options: ['人物；个性', '差异', '事实；现实', '王子'], unit: 2 },
    { word: 'character', meaning: '人物；个性', phonetic: '/ˈkærəktə(r)/', example: '', exampleCn: '', options: ['差异', '空闲的；备用的', '长笛', '人物；个性'], unit: 2 },
    { word: 'pauper', meaning: '贫民；乞丐', phonetic: '/ˈpɔːpə(r)/', example: '', exampleCn: '', options: ['害羞的', '贫民；乞丐', '友谊；友情', '幽默；幽默感'], unit: 2 },
    { word: 'exchange', meaning: '交换', phonetic: '/ɪksˈtʃeɪndʒ/', example: '', exampleCn: '', options: ['外表；露面', '交换', '独自；单独', '除……之外'], unit: 2 },
    { word: 'accident', meaning: '意外；事故', phonetic: '/ˈæksɪdənt/', example: '', exampleCn: '', options: ['意外；事故', '预料；期待', '帮助', '情况；状况'], unit: 2 },
    { word: 'expect', meaning: '预料；期待', phonetic: '/ɪkˈspekt/', example: '', exampleCn: '', options: ['帮助', '关心；担心', '伸手；到达', '预料；期待'], unit: 2 },
    { word: 'silver', meaning: '银色的', phonetic: '/ˈsɪlvə(r)/', example: '', exampleCn: '', options: ['情况；状况', '银色的', '意外；事故', '帮助'], unit: 2 },
    { word: 'lining', meaning: '内衬', phonetic: '/ˈlaɪnɪŋ/', example: '', exampleCn: '', options: ['关心；担心', '预料；期待', '内衬', '银色的'], unit: 2 },
    { word: 'situation', meaning: '情况；状况', phonetic: '/ˌsɪtʃuˈeɪʃn/', example: '', exampleCn: '', options: ['帮助', '银色的', '内衬', '情况；状况'], unit: 2 },
    { word: 'reach', meaning: '伸手；到达', phonetic: '/riːtʃ/', example: '', exampleCn: '', options: ['伸手；到达', '触动；触碰', '意外；事故', '银色的'], unit: 2 },
    { word: 'touch', meaning: '触动；触碰', phonetic: '/tʌtʃ/', example: '', exampleCn: '', options: ['触动；触碰', '预料；期待', '情况；状况', '关心；担心'], unit: 2 },
    { word: 'care about', meaning: '关心；担心', phonetic: '', example: '', exampleCn: '', options: ['关心；担心', '伸手；到达', '内衬', '银色的'], unit: 2 },
    { word: 'lend a hand', meaning: '帮助（某人）', phonetic: '', example: '', exampleCn: '', options: ['预料；期待', '关心；担心', '帮助（某人）', '伸手；到达'], unit: 2 },
    /* Unit 4 */
    { word: 'moss', meaning: '苔藓', phonetic: '/mɒs/', example: '', exampleCn: '', options: ['苔藓', '红杉；红木', '猎豹', '折叠式的'], unit: 3 },
    { word: 'redwood', meaning: '红杉；红木', phonetic: '/ˈredwʊd/', example: '', exampleCn: '', options: ['红杉；红木', '是的；对', '竹；竹子', '广受欢迎的'], unit: 3 },
    { word: 'cheetah', meaning: '猎豹', phonetic: '/ˈtʃiːtə/', example: '', exampleCn: '', options: ['苔藓', '猎豹', '工具；手段', '折叠式的'], unit: 3 },
    { word: 'folding', meaning: '折叠式的', phonetic: '/ˈfəʊldɪŋ/', example: '', exampleCn: '', options: ['出现；看来好像', '实际上；居然', '折叠式的', '广受欢迎的'], unit: 3 },
    { word: 'bamboo', meaning: '竹；竹子', phonetic: '/ˌbæmˈbuː/', example: '', exampleCn: '', options: ['竹；竹子', '美德；营养', '猎豹', '工具；手段'], unit: 3 },
    { word: 'yeah', meaning: '是的；对', phonetic: '/jeə/', example: '', exampleCn: '', options: ['是的；对', '苔藓', '幼苗；嫩芽', '折叠式的'], unit: 3 },
    { word: 'popular', meaning: '广受欢迎的', phonetic: '/ˈpɒpjələ(r)/', example: '', exampleCn: '', options: ['广受欢迎的', '竹子', '工具；手段', '折叠式的'], unit: 3 },
    { word: 'goodness', meaning: '美德；营养', phonetic: '/ˈɡʊdnəs/', example: '', exampleCn: '', options: ['美德；营养', '实际上；居然', '是的；对', '苔藓'], unit: 3 },
    { word: 'tool', meaning: '工具；手段', phonetic: '/tuːl/', example: '', exampleCn: '', options: ['工具；手段', '猎豹', '鹿', '广受欢迎的'], unit: 3 },
    { word: 'actually', meaning: '实际上；居然', phonetic: '/ˈæktʃuəli/', example: '', exampleCn: '', options: ['实际上；居然', '苔藓', '折叠式的', '出现；看来好像'], unit: 3 },
    { word: 'shoot', meaning: '幼苗；嫩芽', phonetic: '/ʃuːt/', example: '', exampleCn: '', options: ['幼苗；嫩芽', '广受欢迎的', '工具；手段', '竹；竹子'], unit: 3 },
    { word: 'appear', meaning: '出现；看来好像', phonetic: '/əˈpɪə(r)/', example: '', exampleCn: '', options: ['出现；看来好像', '美德；营养', '是的；对', '实际上；居然'], unit: 3 },
    { word: 'land', meaning: '陆地；土地', phonetic: '/lænd/', example: '', exampleCn: '', options: ['陆地；土地', '非洲的', '玫瑰；蔷薇', '牡丹；芍药'], unit: 3 },
    { word: 'African', meaning: '非洲的', phonetic: '/ˈæfrɪkən/', example: '', exampleCn: '', options: ['非洲的', '莲花', '蝴蝶', '翅膀；翼'], unit: 3 },
    { word: 'rose', meaning: '玫瑰；蔷薇', phonetic: '/rəʊz/', example: '', exampleCn: '', options: ['玫瑰；蔷薇', '蛙；青蛙', '有……重', '银杏'], unit: 3 },
    { word: 'peony', meaning: '牡丹；芍药', phonetic: '/ˈpiːəni/', example: '', exampleCn: '', options: ['牡丹；芍药', '相信；认为有可能', '省份', '关联；连接'], unit: 3 },
    { word: 'lotus', meaning: '莲花', phonetic: '/ˈləʊtəs/', example: '', exampleCn: '', options: ['莲花', '蝴蝶', '翅膀；翼', '蛙；青蛙'], unit: 3 },
    { word: 'butterfly', meaning: '蝴蝶', phonetic: '/ˈbʌtəflaɪ/', example: '', exampleCn: '', options: ['蝴蝶', '银杏', '省份', '关联；连接'], unit: 3 },
    { word: 'wing', meaning: '翅膀；翼', phonetic: '/wɪŋ/', example: '', exampleCn: '', options: ['翅膀；翼', '蛙；青蛙', '有……重', '玫瑰；蔷薇'], unit: 3 },
    { word: 'frog', meaning: '蛙；青蛙', phonetic: '/frɒɡ/', example: '', exampleCn: '', options: ['蛙；青蛙', '相信；认为有可能', '银杏', '省份'], unit: 3 },
    { word: 'weigh', meaning: '有……重', phonetic: '/weɪ/', example: '', exampleCn: '', options: ['有……重', '银杏', '相信；认为有可能', '关联；连接'], unit: 3 },
    { word: 'ginkgo', meaning: '银杏', phonetic: '/ˈɡɪŋkɡəʊ/', example: '', exampleCn: '', options: ['银杏', '蝴蝶', '翅膀；翼', '蛙；青蛙'], unit: 3 },
    { word: 'believe', meaning: '相信', phonetic: '/bɪˈliːv/', example: '', exampleCn: '', options: ['相信', '关联；连接', '连接的；相关的', '没有；缺乏'], unit: 3 },
    { word: 'province', meaning: '省份', phonetic: '/ˈprɒvɪns/', example: '', exampleCn: '', options: ['省份', '想象；猜想', '蜂蜜', '失望的；沮丧的'], unit: 3 },
    { word: 'connect', meaning: '关联；连接', phonetic: '/kəˈnekt/', example: '', exampleCn: '', options: ['关联；连接', '省份', '相信', '银杏'], unit: 3 },
    { word: 'connected', meaning: '连接的；相关的', phonetic: '/kəˈnektɪd/', example: '', exampleCn: '', options: ['连接的；相关的', '没有；缺乏', '想象；猜想', '蜂蜜'], unit: 3 },
    { word: 'without', meaning: '没有；缺乏', phonetic: '/wɪˈðaʊt/', example: '', exampleCn: '', options: ['没有；缺乏', '连接的；相关的', '相信', '关联；连接'], unit: 3 },
    { word: 'imagine', meaning: '想象；猜想', phonetic: '/ɪˈmædʒɪn/', example: '', exampleCn: '', options: ['想象；猜想', '蜂蜜', '失望的；沮丧的', '联系；连接'], unit: 3 },
    { word: 'honey', meaning: '蜂蜜', phonetic: '/ˈhʌni/', example: '', exampleCn: '', options: ['蜂蜜', '授粉', '花粉', '行动；行为'], unit: 3 },
    { word: 'disappointed', meaning: '失望的；沮丧的', phonetic: '/ˌdɪsəˈpɔɪntɪd/', example: '', exampleCn: '', options: ['失望的；沮丧的', '联系；连接', '授粉', '花粉'], unit: 3 },
    { word: 'connection', meaning: '联系；连接', phonetic: '/kəˈnekʃn/', example: '', exampleCn: '', options: ['联系；连接', '行动；行为', '行星', '贮存；存储'], unit: 3 },
    { word: 'pollination', meaning: '授粉', phonetic: '/ˌpɒləˈneɪʃn/', example: '', exampleCn: '', options: ['授粉', '蜂巢', '交流；沟通', '生态系统'], unit: 3 },
    { word: 'pollen', meaning: '花粉', phonetic: '/ˈpɒlən/', example: '', exampleCn: '', options: ['花粉', '交流；沟通', '保护；防护', '重要性'], unit: 3 },
    { word: 'action', meaning: '行动；行为', phonetic: '/ˈækʃn/', example: '', exampleCn: '', options: ['行动；行为', '标题；题目', '人', '蚂蚁'], unit: 3 },
    { word: 'planet', meaning: '行星', phonetic: '/ˈplænɪt/', example: '', exampleCn: '', options: ['行星', '幸福；快乐', '使失望；使破灭', '蘑菇；伞菌'], unit: 3 },
    { word: 'store', meaning: '贮存；存储', phonetic: '/stɔː(r)/', example: '', exampleCn: '', options: ['贮存；存储', '蜂巢', '交流；沟通', '生态系统'], unit: 3 },
    { word: 'honeycomb', meaning: '蜂巢', phonetic: '/ˈhʌnikəʊm/', example: '', exampleCn: '', options: ['蜂巢', '保护；防护', '重要性', '标题；题目'], unit: 3 },
    { word: 'communicate', meaning: '交流；沟通', phonetic: '/kəˈmjuːnɪkeɪt/', example: '', exampleCn: '', options: ['交流；沟通', '人', '蚂蚁', '幸福；快乐'], unit: 3 },
    { word: 'ecosystem', meaning: '生态系统', phonetic: '/ˈiːkəʊsɪstəm/', example: '', exampleCn: '', options: ['生态系统', '使失望；使破灭', '蘑菇；伞菌', '吨'], unit: 3 },
    { word: 'protect', meaning: '保护；防护', phonetic: '/prəˈtekt/', example: '', exampleCn: '', options: ['保护；防护', '作用；职能', '豌豆', '气候'], unit: 3 },
    { word: 'importance', meaning: '重要性', phonetic: '/ɪmˈpɔːtns/', example: '', exampleCn: '', options: ['重要性', '大海；海洋', '除……之外', '极小的；微小的'], unit: 3 },
    { word: 'title', meaning: '标题；题目', phonetic: '/ˈtaɪtl/', example: '', exampleCn: '', options: ['标题；题目', '行动；行为', '行星', '贮存；存储'], unit: 3 },
    { word: 'human', meaning: '人', phonetic: '/ˈhjuːmən/', example: '', exampleCn: '', options: ['人', '交流；沟通', '生态系统', '保护；防护'], unit: 3 },
    { word: 'ant', meaning: '蚂蚁', phonetic: '/ænt/', example: '', exampleCn: '', options: ['蚂蚁', '幸福；快乐', '使失望；使破灭', '蘑菇；伞菌'], unit: 3 },
    { word: 'happiness', meaning: '幸福；快乐', phonetic: '/ˈhæpinəs/', example: '', exampleCn: '', options: ['幸福；快乐', '吨', '作用；职能', '豌豆'], unit: 3 },
    { word: 'disappoint', meaning: '使失望；使破灭', phonetic: '/ˌdɪsəˈpɔɪnt/', example: '', exampleCn: '', options: ['使失望；使破灭', '气候', '大海；海洋', '除……之外'], unit: 3 },
    { word: 'mushroom', meaning: '蘑菇；伞菌', phonetic: '/ˈmʌʃrʊm/', example: '', exampleCn: '', options: ['蘑菇；伞菌', '极小的；微小的', '精力充沛的', '蚂蚁'], unit: 3 },
    { word: 'ton', meaning: '吨', phonetic: '/tʌn/', example: '', exampleCn: '', options: ['吨', '作用；职能', '豌豆', '气候'], unit: 3 },
    { word: 'role', meaning: '作用；职能', phonetic: '/rəʊl/', example: '', exampleCn: '', options: ['作用；职能', '大海；海洋', '除……之外', '极小的；微小的'], unit: 3 },
    { word: 'pea', meaning: '豌豆', phonetic: '/piː/', example: '', exampleCn: '', options: ['豌豆', '精力充沛的', '吨', '作用；职能'], unit: 3 },
    { word: 'climate', meaning: '气候', phonetic: '/ˈklaɪmət/', example: '', exampleCn: '', options: ['气候', '大海；海洋', '除……之外', '极小的；微小的'], unit: 3 },
    { word: 'ocean', meaning: '大海；海洋', phonetic: '/ˈəʊʃn/', example: '', exampleCn: '', options: ['大海；海洋', '极小的；微小的', '精力充沛的', '气候'], unit: 3 },
    { word: 'except', meaning: '除……之外', phonetic: '/ɪkˈsept/', example: '', exampleCn: '', options: ['除……之外', '气候', '大海；海洋', '极小的；微小的'], unit: 3 },
    { word: 'tiny', meaning: '极小的；微小的', phonetic: '/ˈtaɪni/', example: '', exampleCn: '', options: ['极小的；微小的', '精力充沛的', '除……之外', '气候'], unit: 3 },
    { word: 'lively', meaning: '精力充沛的', phonetic: '/ˈlaɪvli/', example: '', exampleCn: '', options: ['精力充沛的', '极小的；微小的', '大海；海洋', '除……之外'], unit: 3 },
    { word: 'up to', meaning: '直到', phonetic: '', example: '', exampleCn: '', options: ['直到', '散步', '确切地说', '出于这个原因'], unit: 3 },
    { word: 'take a walk', meaning: '散步', phonetic: '', example: '', exampleCn: '', options: ['散步', '确切地说', '出于这个原因', '为了；以便'], unit: 3 },
    { word: 'in fact', meaning: '确切地说', phonetic: '', example: '', exampleCn: '', options: ['确切地说', '散步', '参与某事', '有……栖息'], unit: 3 },
    { word: 'for this reason', meaning: '出于这个原因', phonetic: '', example: '', exampleCn: '', options: ['出于这个原因', '在……中发挥作用', '直到', '散步'], unit: 3 },
    { word: 'in order to', meaning: '为了；以便', phonetic: '', example: '', exampleCn: '', options: ['为了；以便', '在……中发挥作用', '有……栖息', '参与某事'], unit: 3 },
    { word: 'play a part', meaning: '参与某事', phonetic: '', example: '', exampleCn: '', options: ['参与某事', '为了；以便', '直到', '确地说'], unit: 3 },
    { word: 'be home to', meaning: '有……栖息', phonetic: '', example: '', exampleCn: '', options: ['有……栖息', '为了；以便', '在……中发挥作用', '参与某事'], unit: 3 },
    { word: 'play a role', meaning: '在……中发挥作用', phonetic: '', example: '', exampleCn: '', options: ['在……中发挥作用', '有……栖息', '为了；以便', '参与某事'], unit: 3 },
    { word: 'per cent', meaning: '百分之……', phonetic: '', example: '', exampleCn: '', options: ['百分之……', '参与某事', '有……栖息', '在……中发挥作用'], unit: 3 },
    { word: 'feel free', meaning: '可以随便做', phonetic: '', example: '', exampleCn: '', options: ['可以随便做', '直到', '散步', '确切地说'], unit: 3 },
    { word: 'be connected with', meaning: '与……有关联', phonetic: '', example: '', exampleCn: '', options: ['与……有关联', '为了；以便', '参与某事', '有……栖息'], unit: 3 },
    /* Unit 5 */
    { word: 'pepper', meaning: '胡椒粉', phonetic: '/ˈpepə(r)/', example: '', exampleCn: '', options: ['胡椒粉', '面粉', '烘焙', '烤箱'], unit: 4 },
    { word: 'mix', meaning: '混合', phonetic: '/mɪks/', example: '', exampleCn: '', options: ['混合', '煮沸；烧开', '黄油', '奶酪'], unit: 4 },
    { word: 'bake', meaning: '烘焙', phonetic: '/beɪk/', example: '', exampleCn: '', options: ['烘焙', '煮沸；烧开', '黄油', '奶酪'], unit: 4 },
    { word: 'oven', meaning: '烤箱', phonetic: '/ˈʌvn/', example: '', exampleCn: '', options: ['烤箱', '甜；芬芳', '糨饼；薄饼', '圣诞节'], unit: 4 },
    { word: 'flour', meaning: '面粉', phonetic: '/ˈflaʊə(r)/', example: '', exampleCn: '', options: ['面粉', '黄油', '奶酪', '一汤匙'], unit: 4 },
    { word: 'boil', meaning: '煮沸；烧开', phonetic: '/bɔɪl/', example: '', exampleCn: '', options: ['煮沸；烧开', '混合', '烘焙', '黄油'], unit: 4 },
    { word: 'butter', meaning: '黄油', phonetic: '/ˈbʌtə(r)/', example: '', exampleCn: '', options: ['黄油', '一汤匙', '捣烂；捣碎', '翻炒'], unit: 4 },
    { word: 'cheese', meaning: '奶酪', phonetic: '/tʃiːz/', example: '', exampleCn: '', options: ['奶酪', '黄油', '一汤匙', '混合'], unit: 4 },
    { word: 'tablespoon', meaning: '一汤匙', phonetic: '/ˈteɪblspuːn/', example: '', exampleCn: '', options: ['一汤匙', '捣烂；捣碎', '翻炒', '黄油'], unit: 4 },
    { word: 'mash', meaning: '捣烂；捣碎', phonetic: '/mæʃ/', example: '', exampleCn: '', options: ['捣烂；捣碎', '翻炒', '黄油', '奶酪'], unit: 4 },
    { word: 'stir-fry', meaning: '翻炒', phonetic: '/ˈstɜːfraɪ/', example: '', exampleCn: '', options: ['翻炒', '捣烂；捣碎', '处理', '碗；钵；盆'], unit: 4 },
    { word: 'do with', meaning: '处理', phonetic: '', example: '', exampleCn: '', options: ['处理', '碗；钵；盆', '加热；变热', '食用油'], unit: 4 },
    { word: 'bowl', meaning: '碗；钵；盆', phonetic: '/bəʊl/', example: '', exampleCn: '', options: ['碗；钵；盆', '加热；变热', '平底锅', '简单的；朴素的'], unit: 4 },
    { word: 'heat', meaning: '加热；变热', phonetic: '/hiːt/', example: '', exampleCn: '', options: ['加热；变热', '食用油', '平底锅', '简单的；朴素的'], unit: 4 },
    { word: 'oil', meaning: '食用油', phonetic: '/ɔɪl/', example: '', exampleCn: '', options: ['食用油', '平底锅', '简单的；朴素的', '食材；成分'], unit: 4 },
    { word: 'pan', meaning: '平底锅', phonetic: '/pæn/', example: '', exampleCn: '', options: ['平底锅', '食材；成分', '用法说明', '酸的'], unit: 4 },
    { word: 'simple', meaning: '简单的；朴素的', phonetic: '/ˈsɪmpl/', example: '', exampleCn: '', options: ['简单的；朴素的', '食材；成分', '脏乱；凌乱', '漂亮的'], unit: 4 },
    { word: 'ingredient', meaning: '食材；成分', phonetic: '/ɪnˈɡriːdiənt/', example: '', exampleCn: '', options: ['食材；成分', '用法说明', '酸的', '脏乱；凌乱'], unit: 4 },
    { word: 'instruction', meaning: '用法说明', phonetic: '/ɪnˈstrʌkʃn/', example: '', exampleCn: '', options: ['用法说明', '酸的', '脏乱；凌乱', '漂亮的'], unit: 4 },
    { word: 'sour', meaning: '酸的', phonetic: '/ˈsaʊə(r)/', example: '', exampleCn: '', options: ['酸的', '脏乱；凌乱', '漂亮的', '圣诞节'], unit: 4 },
    { word: 'mess', meaning: '脏乱；凌乱', phonetic: '/mes/', example: '', exampleCn: '', options: ['脏乱；凌乱', '圣诞节', '糨饼；薄饼', '梦想；梦'], unit: 4 },
    { word: 'pretty', meaning: '漂亮的', phonetic: '/ˈprɪti/', example: '', exampleCn: '', options: ['漂亮的', '糨饼；薄饼', '梦想；梦', '大学'], unit: 4 },
    { word: 'Christmas', meaning: '圣诞节', phonetic: '/ˈkrɪsməs/', example: '', exampleCn: '', options: ['圣诞节', '漂亮的', '糨饼；薄饼', '大学'], unit: 4 },
    { word: 'pancake', meaning: '糨饼；薄饼', phonetic: '/ˈpænkeɪk/', example: '', exampleCn: '', options: ['糨饼；薄饼', '大学', '回忆；记忆', '看得见的；可见的'], unit: 4 },
    { word: 'dream', meaning: '梦想；梦', phonetic: '/driːm/', example: '', exampleCn: '', options: ['梦想；梦', '糨饼；薄饼', '大学', '回忆；记忆'], unit: 4 },
    { word: 'university', meaning: '大学', phonetic: '/ˌjuːnɪˈvɜːsəti/', example: '', exampleCn: '', options: ['大学', '南瓜', '果馅饼', '肉桂皮'], unit: 4 },
    { word: 'memory', meaning: '回忆；记忆', phonetic: '/ˈmeməri/', example: '', exampleCn: '', options: ['回忆；记忆', '南瓜', '果馅饼', '肉桂皮'], unit: 4 },
    { word: 'visible', meaning: '看得见的；可见的', phonetic: '/ˈvɪzəbl/', example: '', exampleCn: '', options: ['看得见的；可见的', '甜；芬芳', '学院；大学', '主人；东道主'], unit: 4 },
    { word: 'pumpkin', meaning: '南瓜', phonetic: '/ˈpʌmpkɪn/', example: '', exampleCn: '', options: ['南瓜', '果馅饼', '肉桂皮', '甜；芬芳'], unit: 4 },
    { word: 'pie', meaning: '果馅饼', phonetic: '/paɪ/', example: '', exampleCn: '', options: ['果馅饼', '肉桂皮', '甜；芬芳', '学院；大学'], unit: 4 },
    { word: 'cinnamon', meaning: '肉桂皮', phonetic: '/ˈsɪnəmən/', example: '', exampleCn: '', options: ['肉桂皮', '南瓜', '果馅饼', '甜；芬芳'], unit: 4 },
    { word: 'sweetness', meaning: '甜；芬芳', phonetic: '/ˈswiːtnəs/', example: '', exampleCn: '', options: ['甜；芬芳', '果馅饼', '肉桂皮', '南瓜'], unit: 4 },
    { word: 'college', meaning: '学院；大学', phonetic: '/ˈkɒlɪdʒ/', example: '', exampleCn: '', options: ['学院；大学', '女主人', '食谱', '奶油'], unit: 4 },
    { word: 'host', meaning: '主人；东道主', phonetic: '/həʊst/', example: '', exampleCn: '', options: ['主人；东道主', '食谱', '奶油', '糕饼酥皮'], unit: 4 },
    { word: 'hostess', meaning: '女主人', phonetic: '/ˈhəʊstəs/', example: '', exampleCn: '', options: ['女主人', '奶油', '糕饼酥皮', '混合物'], unit: 4 },
    { word: 'recipe', meaning: '食谱', phonetic: '/ˈresəpi/', example: '', exampleCn: '', options: ['食谱', '糕饼酥皮', '混合物', '最小；最少'], unit: 4 },
    { word: 'cream', meaning: '奶油', phonetic: '/kriːm/', example: '', exampleCn: '', options: ['奶油', '混合物', '最小；最少', '诀窍；秘密'], unit: 4 },
    { word: 'crust', meaning: '糕饼酥皮', phonetic: '/krʌst/', example: '', exampleCn: '', options: ['糕饼酥皮', '最小；最少', '诀窍；秘密', '每当'], unit: 4 },
    { word: 'mixture', meaning: '混合物', phonetic: '/ˈmɪkstʃə(r)/', example: '', exampleCn: '', options: ['混合物', '诀窍；秘密', '每当', '项目；条'], unit: 4 },
    { word: 'least', meaning: '最小；最少', phonetic: '/liːst/', example: '', exampleCn: '', options: ['最小；最少', '每当', '项目；条', '意大利细面条'], unit: 4 },
    { word: 'secret', meaning: '诀窍；秘密', phonetic: '/ˈsiːkrət/', example: '', exampleCn: '', options: ['诀窍；秘密', '项目；条', '意大利细面条', '一勺的量'], unit: 4 },
    { word: 'whenever', meaning: '每当', phonetic: '/wenˈevə(r)/', example: '', exampleCn: '', options: ['每当', '意大利细面条', '一勺的量', '薄片；片'], unit: 4 },
    { word: 'item', meaning: '项目；条', phonetic: '/ˈaɪtəm/', example: '', exampleCn: '', options: ['项目；条', '一勺的量', '薄片；片', '夫妻；情侣'], unit: 4 },
    { word: 'spaghetti', meaning: '意大利细面条', phonetic: '/spəˈɡeti/', example: '', exampleCn: '', options: ['意大利细面条', '薄片；片', '夫妻；情侣', '岛'], unit: 4 },
    { word: 'spoon', meaning: '一勺的量', phonetic: '/spuːn/', example: '', exampleCn: '', options: ['一勺的量', '夫妻；情侣', '岛', '妻子'], unit: 4 },
    { word: 'slice', meaning: '薄片；片', phonetic: '/slaɪs/', example: '', exampleCn: '', options: ['薄片；片', '岛', '妻子', '单独的'], unit: 4 },
    { word: 'couple', meaning: '夫妻；情侣', phonetic: '/ˈkʌpl/', example: '', exampleCn: '', options: ['夫妻；情侣', '妻子', '单独的', '出生'], unit: 4 },
    { word: 'island', meaning: '岛', phonetic: '/ˈaɪlənd/', example: '', exampleCn: '', options: ['岛', '单独的', '出生', '薄片；片'], unit: 4 },
    { word: 'wife', meaning: '妻子', phonetic: '/waɪf/', example: '', exampleCn: '', options: ['妻子', '岛', '单独的', '出生'], unit: 4 },
    { word: 'separate', meaning: '单独的', phonetic: '/ˈseprət/', example: '', exampleCn: '', options: ['单独的', '出生', '处理', '碗；钵；盆'], unit: 4 },
    { word: 'born', meaning: '出生', phonetic: '/bɔːn/', example: '', exampleCn: '', options: ['出生', '单独的', '加热；变热', '食用油'], unit: 4 },
    /* Unit 6 */
    { word: 'yourself', meaning: '你自己', phonetic: '/jɔːˈself/', example: '', exampleCn: '', options: ['你自己', '工程师', '提前；在前面', '设计；计划'], unit: 5 },
    { word: 'engineer', meaning: '工程师', phonetic: '/ˌendʒɪˈnɪə(r)/', example: '', exampleCn: '', options: ['工程师', '桥', '最后的；最终的', '信心；信任'], unit: 5 },
    { word: 'ahead', meaning: '提前；在前面', phonetic: '/əˈhed/', example: '', exampleCn: '', options: ['提前；在前面', '设计；计划', '桥', '最后的；最终的'], unit: 5 },
    { word: 'design', meaning: '设计；计划', phonetic: '/dɪˈzaɪn/', example: '', exampleCn: '', options: ['设计；计划', '信心；信任', '形成；组成', '关系；联系'], unit: 5 },
    { word: 'bridge', meaning: '桥', phonetic: '/brɪdʒ/', example: '', exampleCn: '', options: ['桥', '关系；联系', '俯卧撑', '精力充沛的'], unit: 5 },
    { word: 'final', meaning: '最后的；最终的', phonetic: '/ˈfaɪnl/', example: '', exampleCn: '', options: ['最后的；最终的', '形成；组成', '俯卧撑', '精力充沛的'], unit: 5 },
    { word: 'confidence', meaning: '信心；信任', phonetic: '/ˈkɒnfɪdəns/', example: '', exampleCn: '', options: ['信心；信任', '俯卧撑', '精力充沛的', '桥'], unit: 5 },
    { word: 'form', meaning: '形成；组成', phonetic: '/fɔːm/', example: '', exampleCn: '', options: ['形成；组成', '精力充沛的', '工程师', '提前；在前面'], unit: 5 },
    { word: 'relationship', meaning: '关系；联系', phonetic: '/rɪˈleɪʃnʃɪp/', example: '', exampleCn: '', options: ['关系；联系', '设计；计划', '桥', '最后的；最终的'], unit: 5 },
    { word: 'push-up', meaning: '俯卧撑', phonetic: '/ˈpʊʃʌp/', example: '', exampleCn: '', options: ['俯卧撑', '精力充沛的', '桥', '关系；联系'], unit: 5 },
    { word: 'energetic', meaning: '精力充沛的', phonetic: '/ˌenəˈdʒetɪk/', example: '', exampleCn: '', options: ['精力充沛的', '俯卧撑', '信心；信任', '形成；组成'], unit: 5 },
    { word: 'put out', meaning: '扑灭', phonetic: '', example: '', exampleCn: '', options: ['扑灭', '即将结束', '最后但同等重要的', '你自己'], unit: 5 },
    { word: 'draw to a close', meaning: '即将结束', phonetic: '', example: '', exampleCn: '', options: ['即将结束', '最后但同等重要的', '接替；接管', '扑灭'], unit: 5 },
    { word: 'last but not least', meaning: '最后但同等重要的', phonetic: '', example: '', exampleCn: '', options: ['最后但同等重要的', '扑灭', '即将结束', '接替；接管'], unit: 5 },
    /* Unit 7 */
    { word: 'prediction', meaning: '预测；预言', phonetic: '/prɪˈdɪkʃn/', example: '', exampleCn: '', options: ['预测；预言', '外围的；外表的', '更差的；更糟的', '票；券'], unit: 6 },
    { word: 'outer', meaning: '外围的；外表的', phonetic: '/ˈaʊtə(r)/', example: '', exampleCn: '', options: ['外围的；外表的', '乐观的；积极的', '交通；运输', '科技；工艺'], unit: 6 },
    { word: 'worse', meaning: '更差的；更糟的', phonetic: '/wɜːs/', example: '', exampleCn: '', options: ['更差的；更糟的', '系统', '效率高的', '教育'], unit: 6 },
    { word: 'ticket', meaning: '票；券', phonetic: '/ˈtɪkɪt/', example: '', exampleCn: '', options: ['票；券', '视频', '交通运输系统', '系统'], unit: 6 },
    { word: 'positive', meaning: '乐观的；积极的', phonetic: '/ˈpɒzətɪv/', example: '', exampleCn: '', options: ['乐观的；积极的', '时长；长度', '话题；题目', '搭档；同伴'], unit: 6 },
    { word: 'traffic', meaning: '交通；运输', phonetic: '/ˈtræfɪk/', example: '', exampleCn: '', options: ['交通；运输', '将要；将会', '及格；通过', '优胜者；成功者'], unit: 6 },
    { word: 'technology', meaning: '科技；工艺', phonetic: '/tekˈnɒlədʒi/', example: '', exampleCn: '', options: ['科技；工艺', '药物；疗法', '癌症', '音乐会'], unit: 6 },
    { word: 'video', meaning: '视频', phonetic: '/ˈvɪdiəʊ/', example: '', exampleCn: '', options: ['视频', '现金', '钱包；皮夹', '客人；宾客'], unit: 6 },
    { word: 'transport', meaning: '交通运输系统', phonetic: '/ˈtrænspɔːt/', example: '', exampleCn: '', options: ['交通运输系统', '首席的；最重要的', '研究者', '研究；调查'], unit: 6 },
    { word: 'system', meaning: '系统', phonetic: '/ˈsɪstəm/', example: '', exampleCn: '', options: ['系统', '未来学家', '到处；所有地方', '机器人学'], unit: 6 },
    { word: 'efficient', meaning: '效率高的', phonetic: '/ɪˈfɪʃnt/', example: '', exampleCn: '', options: ['效率高的', '行业；工业', '服务', '灾难；不幸'], unit: 6 },
    { word: 'education', meaning: '教育', phonetic: '/ˌedʒuˈkeɪʃn/', example: '', exampleCn: '', options: ['教育', '突发事件', '消失；不见', '挑战性的'], unit: 6 },
    { word: 'length', meaning: '时长；长度', phonetic: '/leŋθ/', example: '', exampleCn: '', options: ['时长；长度', '飞行员', '专家；行家', '代替；取代'], unit: 6 },
    { word: 'topic', meaning: '话题；题目', phonetic: '/ˈtɒpɪk/', example: '', exampleCn: '', options: ['话题；题目', '创造力', '情感的；情绪的', '智力；智慧'], unit: 6 },
    { word: 'partner', meaning: '搭档；同伴', phonetic: '/ˈpɑːtnə(r)/', example: '', exampleCn: '', options: ['搭档；同伴', '提到；写到', '冰箱', '低的；矮的'], unit: 6 },
    { word: 'shall', meaning: '将要；将会', phonetic: '/ʃəl/', example: '', exampleCn: '', options: ['将要；将会', '接受；相信', '影响', '创造性的'], unit: 6 },
    { word: 'pass', meaning: '及格；通过', phonetic: '/pɑːs/', example: '', exampleCn: '', options: ['及格；通过', '不可能的', '素质；质量', '增强；发展'], unit: 6 },
    { word: 'winner', meaning: '优胜者；成功者', phonetic: '/ˈwɪnə(r)/', example: '', exampleCn: '', options: ['优胜者；成功者', '德语；德国人', '很有用的；宝贵的', '公共的；公众的'], unit: 6 },
    { word: 'cure', meaning: '药物；疗法', phonetic: '/kjʊə(r)/', example: '', exampleCn: '', options: ['药物；疗法', '医学的；医疗的', '挑战；质疑', '任务；工作'], unit: 6 },
    { word: 'cancer', meaning: '癌症', phonetic: '/ˈkænsə(r)/', example: '', exampleCn: '', options: ['癌症', '取决于；依靠', '来访；拜访', '只要'], unit: 6 },
    { word: 'concert', meaning: '音乐会', phonetic: '/ˈkɒnsət/', example: '', exampleCn: '', options: ['音乐会', '表达；交流', '手势；迹象', '说话者'], unit: 6 },
    { word: 'cash', meaning: '现金', phonetic: '/kæʃ/', example: '', exampleCn: '', options: ['现金', '排演；排练', '当地的', '面对面的'], unit: 6 },
    { word: 'wallet', meaning: '钱包；皮夹', phonetic: '/ˈwɒlɪt/', example: '', exampleCn: '', options: ['钱包；皮夹', '教授', '演说；发言', '争论；争吵'], unit: 6 },
    { word: 'guest', meaning: '客人；宾客', phonetic: '/ɡest/', example: '', exampleCn: '', options: ['客人；宾客', '较喜欢', '镇静的；沉着的', '表达方式'], unit: 6 },
    { word: 'chief', meaning: '首席的；最重要的', phonetic: '/tʃiːf/', example: '', exampleCn: '', options: ['首席的；最重要的', '机会；可能性', '会面；会议', '困难；难题'], unit: 6 },
    { word: 'researcher', meaning: '研究者', phonetic: '/rɪˈsɜːtʃə(r)/', example: '', exampleCn: '', options: ['研究者', '字行；便条；线', '细节；详情', '团聚；重逢'], unit: 6 },
    { word: 'research', meaning: '研究；调查', phonetic: '/rɪˈsɜːtʃ/', example: '', exampleCn: '', options: ['研究；调查', '严肃地；认真地', '训练；培训', '担忧的；焦虑的'], unit: 6 },
    { word: 'futurist', meaning: '未来学家', phonetic: '/ˈfjuːtʃərɪst/', example: '', exampleCn: '', options: ['未来学家', '系统', '到处；所有地方', '机器人学'], unit: 6 },
    { word: 'everywhere', meaning: '到处', phonetic: '/ˈevriweə(r)/', example: '', exampleCn: '', options: ['到处', '机器人学', '行业；工业', '服务'], unit: 6 },
    { word: 'robotics', meaning: '机器人学', phonetic: '/rəʊˈbɒtɪks/', example: '', exampleCn: '', options: ['机器人学', '灾难；不幸', '突发事件', '消失；不见'], unit: 6 },
    { word: 'industry', meaning: '行业；工业', phonetic: '/ˈɪndəstri/', example: '', exampleCn: '', options: ['行业；工业', '挑战性的', '飞行员', '专家；行家'], unit: 6 },
    { word: 'service', meaning: '服务', phonetic: '/ˈsɜːvɪs/', example: '', exampleCn: '', options: ['服务', '代替；取代', '创造力', '情感的；情绪的'], unit: 6 },
    { word: 'disaster', meaning: '灾难；不幸', phonetic: '/dɪˈzɑːstə(r)/', example: '', exampleCn: '', options: ['灾难；不幸', '智力；智慧', '提到；写到', '冰箱'], unit: 6 },
    { word: 'emergency', meaning: '突发事件', phonetic: '/ɪˈmɜːdʒənsi/', example: '', exampleCn: '', options: ['突发事件', '低的；矮的', '接受；相信', '影响'], unit: 6 },
    { word: 'disappear', meaning: '消失；不见', phonetic: '/ˌdɪsəˈpɪə(r)/', example: '', exampleCn: '', options: ['消失；不见', '接受；相信', '影响', '创造性的'], unit: 6 },
    { word: 'challenging', meaning: '挑战性的', phonetic: '/ˈtʃælɪndʒɪŋ/', example: '', exampleCn: '', options: ['挑战性的', '不可能的', '素质；质量', '增强；发展'], unit: 6 },
    { word: 'pilot', meaning: '飞行员', phonetic: '/ˈpaɪlət/', example: '', exampleCn: '', options: ['飞行员', '德语；德国人', '很有用的；宝贵的', '公共的；公众的'], unit: 6 },
    { word: 'expert', meaning: '专家；行家', phonetic: '/ˈekspɜːt/', example: '', exampleCn: '', options: ['专家；行家', '医学的；医疗的', '挑战；质疑', '任务；工作'], unit: 6 },
    { word: 'replace', meaning: '代替；取代', phonetic: '/rɪˈpleɪs/', example: '', exampleCn: '', options: ['代替；取代', '取决于；依靠', '来访；拜访', '只要'], unit: 6 },
    { word: 'creativity', meaning: '创造力', phonetic: '/ˌkriːeɪˈtɪvəti/', example: '', exampleCn: '', options: ['创造力', '服务', '灾难；不幸', '突发事件'], unit: 6 },
    { word: 'emotional', meaning: '情感的；情绪的', phonetic: '/ɪˈməʊʃənl/', example: '', exampleCn: '', options: ['情感的；情绪的', '消失；不见', '挑战性的', '飞行员'], unit: 6 },
    { word: 'intelligence', meaning: '智力；智慧', phonetic: '/ɪnˈtelɪdʒəns/', example: '', exampleCn: '', options: ['智力；智慧', '行业；工业', '机器人学', '到处'], unit: 6 },
    { word: 'mention', meaning: '提到；写到', phonetic: '/ˈmenʃn/', example: '', exampleCn: '', options: ['提到；写到', '冰箱', '低的；矮的', '接受；相信'], unit: 6 },
    { word: 'refrigerator', meaning: '冰箱', phonetic: '/rɪˈfrɪdʒəreɪtə(r)/', example: '', exampleCn: '', options: ['冰箱', '影响', '创造性的', '不可能的'], unit: 6 },
    { word: 'low', meaning: '低的；矮的', phonetic: '/ləʊ/', example: '', exampleCn: '', options: ['低的；矮的', '素质；质量', '增强；发展', '德语；德国人'], unit: 6 },
    { word: 'accept', meaning: '接受；相信', phonetic: '/əkˈsept/', example: '', exampleCn: '', options: ['接受；相信', '很有用的；宝贵的', '公共的；公众的', '医学的；医疗的'], unit: 6 },
    { word: 'influence', meaning: '影响', phonetic: '/ˈɪnfluəns/', example: '', exampleCn: '', options: ['影响', '挑战；质疑', '任务；工作', '取决于；依靠'], unit: 6 },
    { word: 'creative', meaning: '创造性的', phonetic: '/kriˈeɪtɪv/', example: '', exampleCn: '', options: ['创造性的', '来访；拜访', '只要', '表达；交流'], unit: 6 },
    { word: 'impossible', meaning: '不可能的', phonetic: '/ɪmˈpɒsəbl/', example: '', exampleCn: '', options: ['不可能的', '素质；质量', '增强；发展', '德语；德国人'], unit: 6 },
    { word: 'quality', meaning: '素质；质量', phonetic: '/ˈkwɒləti/', example: '', exampleCn: '', options: ['素质；质量', '很有用的；宝贵的', '公共的；公众的', '医学的；医疗的'], unit: 6 },
    { word: 'develop', meaning: '增强；发展', phonetic: '/dɪˈveləp/', example: '', exampleCn: '', options: ['增强；发展', '挑战；质疑', '任务；工作', '取决于；依靠'], unit: 6 },
    { word: 'German', meaning: '德语；德国人', phonetic: '/ˈdʒɜːmən/', example: '', exampleCn: '', options: ['德语；德国人', '来访；拜访', '只要', '表达；交流'], unit: 6 },
    { word: 'valuable', meaning: '很有用的；宝贵的', phonetic: '/ˈvæljuəbl/', example: '', exampleCn: '', options: ['很有用的；宝贵的', '公共的；公众的', '医学的；医疗的', '挑战；质疑'], unit: 6 },
    { word: 'public', meaning: '公共的；公众的', phonetic: '/ˈpʌblɪk/', example: '', exampleCn: '', options: ['公共的；公众的', '任务；工作', '取决于；依靠', '来访；拜访'], unit: 6 },
    { word: 'medical', meaning: '医学的；医疗的', phonetic: '/ˈmedɪkl/', example: '', exampleCn: '', options: ['医学的；医疗的', '只要', '表达；交流', '手势；迹象'], unit: 6 },
    { word: 'challenge', meaning: '挑战；质疑', phonetic: '/ˈtʃælɪndʒ/', example: '', exampleCn: '', options: ['挑战；质疑', '任务；工作', '取决于；依靠', '来访；拜访'], unit: 6 },
    { word: 'task', meaning: '任务；工作', phonetic: '/tɑːsk/', example: '', exampleCn: '', options: ['任务；工作', '只要', '表达；交流', '手势；迹象'], unit: 6 },
    { word: 'depend', meaning: '取决于；依靠', phonetic: '/dɪˈpend/', example: '', exampleCn: '', options: ['取决于；依靠', '只要', '表达；交流', '手势；迹象'], unit: 6 },
    { word: 'take over', meaning: '接替；接管', phonetic: '', example: '', exampleCn: '', options: ['接替；接管', '扑灭', '即将结束', '最后但同等重要的'], unit: 6 },
    { word: 'run low', meaning: '即将用尽', phonetic: '', example: '', exampleCn: '', options: ['即将用尽', '扑灭', '即将结束', '最后但同等重要的'], unit: 6 },
    { word: 'depend on', meaning: '取决于；依靠', phonetic: '', example: '', exampleCn: '', options: ['取决于；依靠', '接替；接管', '即将用尽', '扑灭'], unit: 6 },
    { word: 'as long as', meaning: '只要', phonetic: '', example: '', exampleCn: '', options: ['只要', '取决于；依靠', '接替；接管', '即将用尽'], unit: 6 },
    { word: 'come over', meaning: '来访；拜访', phonetic: '', example: '', exampleCn: '', options: ['来访；拜访', '只要', '取决于；依靠', '接替；接管'], unit: 6 },
    /* Unit 8 */
    { word: 'communication', meaning: '表达；交流', phonetic: '/kəˌmjuːnɪˈkeɪʃn/', example: '', exampleCn: '', options: ['表达；交流', '手势；迹象', '说话者', '排演；排练'], unit: 7 },
    { word: 'sign', meaning: '手势；迹象', phonetic: '/saɪn/', example: '', exampleCn: '', options: ['手势；迹象', '说话者', '排演；排练', '当地的'], unit: 7 },
    { word: 'speaker', meaning: '说话者', phonetic: '/ˈspiːkə(r)/', example: '', exampleCn: '', options: ['说话者', '排演；排练', '当地的', '面对面的'], unit: 7 },
    { word: 'rehearsal', meaning: '排演；排练', phonetic: '/rɪˈhɜːsl/', example: '', exampleCn: '', options: ['排演；排练', '面对面的', '教授', '演说；发言'], unit: 7 },
    { word: 'local', meaning: '当地的', phonetic: '/ˈləʊkl/', example: '', exampleCn: '', options: ['当地的', '面对面的', '教授', '演说；发言'], unit: 7 },
    { word: 'face-to-face', meaning: '面对面的', phonetic: '', example: '', exampleCn: '', options: ['面对面的', '演说；发言', '争论；争吵', '较喜欢'], unit: 7 },
    { word: 'professor', meaning: '教授', phonetic: '/prəˈfesə(r)/', example: '', exampleCn: '', options: ['教授', '争论；争吵', '较喜欢', '镇静的；沉着的'], unit: 7 },
    { word: 'speech', meaning: '演说；发言', phonetic: '/spiːtʃ/', example: '', exampleCn: '', options: ['演说；发言', '较喜欢', '镇静的；沉着的', '表达方式'], unit: 7 },
    { word: 'argue', meaning: '争论；争吵', phonetic: '/ˈɑːɡjuː/', example: '', exampleCn: '', options: ['争论；争吵', '表达方式', '机会；可能性', '会面；会议'], unit: 7 },
    { word: 'prefer', meaning: '较喜欢', phonetic: '/prɪˈfɜː(r)/', example: '', exampleCn: '', options: ['较喜欢', '困难；难题', '字行；便条；线', '细节；详情'], unit: 7 },
    { word: 'calm', meaning: '镇静的；沉着的', phonetic: '/kɑːm/', example: '', exampleCn: '', options: ['镇静的；沉着的', '团聚；重逢', '严肃地；认真地', '训练；培训'], unit: 7 },
    { word: 'expression', meaning: '表达方式', phonetic: '/ɪkˈspreʃn/', example: '', exampleCn: '', options: ['表达方式', '担忧的；焦虑的', '陌生人', '指点；实用的提示'], unit: 7 },
    { word: 'chance', meaning: '机会；可能性', phonetic: '/tʃɑːns/', example: '', exampleCn: '', options: ['机会；可能性', '认真地；仔细地', '听者', '观点；重点'], unit: 7 },
    { word: 'meeting', meaning: '会面；会议', phonetic: '/ˈmiːtɪŋ/', example: '', exampleCn: '', options: ['会面；会议', '想必；必定', '持续；继续做', '不礼貌的；粗鲁的'], unit: 7 },
    { word: 'difficulty', meaning: '困难；难题', phonetic: '/ˈdɪfɪkəlti/', example: '', exampleCn: '', options: ['困难；难题', '个人的；私人的', '真诚的；诚实的', '付费；交纳'], unit: 7 },
    { word: 'line', meaning: '字行；便条；线', phonetic: '/laɪn/', example: '', exampleCn: '', options: ['字行；便条；线', '注意；专心', '提供；主动提出', '公平的；合理的'], unit: 7 },
    { word: 'detail', meaning: '细节；详情', phonetic: '/ˈdiːteɪl/', example: '', exampleCn: '', options: ['细节；详情', '社会的；社交的', '媒介；手段', '信任；相信'], unit: 7 },
    { word: 'reunion', meaning: '团聚；重逢', phonetic: '/ˌriːˈjuːniən/', example: '', exampleCn: '', options: ['团聚；重逢', '误解；误会', '公开活动', '费用；价钱'], unit: 7 },
    { word: 'seriously', meaning: '严肃地；认真地', phonetic: '/ˈsɪəriəsli/', example: '', exampleCn: '', options: ['严肃地；认真地', '机会；时机', '对……有用', '回答；回复'], unit: 7 },
    { word: 'training', meaning: '训练；培训', phonetic: '/ˈtreɪnɪŋ/', example: '', exampleCn: '', options: ['训练；培训', '荣幸；尊敬', '真诚地；诚实地', '开篇的；开始的'], unit: 7 },
    { word: 'nervous', meaning: '担忧的；焦虑的', phonetic: '/ˈnɜːvəs/', example: '', exampleCn: '', options: ['担忧的；焦虑的', '结尾的；结束的', '句子；判决', '日期；日子'], unit: 7 },
    { word: 'stranger', meaning: '陌生人', phonetic: '/ˈstreɪndʒə(r)/', example: '', exampleCn: '', options: ['陌生人', '从句；分句', '表达方式', '机会；可能性'], unit: 7 },
    { word: 'tip', meaning: '指点；实用的提示', phonetic: '/tɪp/', example: '', exampleCn: '', options: ['指点；实用的提示', '听者', '观点；重点', '想必；必定'], unit: 7 },
    { word: 'carefully', meaning: '认真地；仔细地', phonetic: '/ˈkeəfəli/', example: '', exampleCn: '', options: ['认真地；仔细地', '持续；继续做', '不礼貌的；粗鲁的', '个人的；私人的'], unit: 7 },
    { word: 'listener', meaning: '听者', phonetic: '/ˈlɪsənə(r)/', example: '', exampleCn: '', options: ['听者', '真诚的；诚实的', '付费；交纳', '注意；专心'], unit: 7 },
    { word: 'point', meaning: '观点；重点', phonetic: '/pɔɪnt/', example: '', exampleCn: '', options: ['观点；重点', '提供；主动提出', '公平的；合理的', '社会的；社交的'], unit: 7 },
    { word: 'surely', meaning: '想必；必定', phonetic: '/ˈʃʊəli/', example: '', exampleCn: '', options: ['想必；必定', '媒介；手段', '信任；相信', '误解；误会'], unit: 7 },
    { word: 'continue', meaning: '持续；继续做', phonetic: '/kənˈtɪnjuː/', example: '', exampleCn: '', options: ['持续；继续做', '公开活动', '费用；价钱', '机会；时机'], unit: 7 },
    { word: 'impolite', meaning: '不礼貌的；粗鲁的', phonetic: '/ˌɪmpəˈlaɪt/', example: '', exampleCn: '', options: ['不礼貌的；粗鲁的', '对……有用', '回答；回复', '荣幸；尊敬'], unit: 7 },
    { word: 'personal', meaning: '个人的；私人的', phonetic: '/ˈpɜːsənl/', example: '', exampleCn: '', options: ['个人的；私人的', '真诚地；诚实地', '开篇的；开始的', '结尾的；结束的'], unit: 7 },
    { word: 'sincere', meaning: '真诚的；诚实的', phonetic: '/sɪnˈsɪə(r)/', example: '', exampleCn: '', options: ['真诚地；诚实地', '开篇的；开始的', '结尾的；结束的', '句子；判决'], unit: 7 },
    { word: 'pay', meaning: '付费；交纳', phonetic: '/peɪ/', example: '', exampleCn: '', options: ['付费；交纳', '日期；日子', '从句；分句', '注意；专心'], unit: 7 },
    { word: 'attention', meaning: '注意；专心', phonetic: '/əˈtenʃn/', example: '', exampleCn: '', options: ['注意；专心', '提供；主动提出', '公平的；合理的', '社会的；社交的'], unit: 7 },
    { word: 'offer', meaning: '提供；主动提出', phonetic: '/ˈɒfə(r)/', example: '', exampleCn: '', options: ['提供；主动提出', '公平的；合理的', '社会的；社交的', '媒介；手段'], unit: 7 },
    { word: 'reasonable', meaning: '公平的；合理的', phonetic: '/ˈriːznəbl/', example: '', exampleCn: '', options: ['公平的；合理的', '信任；相信', '误解；误会', '公开活动'], unit: 7 },
    { word: 'social', meaning: '社会的；社交的', phonetic: '/ˈsəʊʃl/', example: '', exampleCn: '', options: ['社会的；社交的', '费用；价钱', '机会；时机', '对……有用'], unit: 7 },
    { word: 'medium', meaning: '媒介；手段', phonetic: '/ˈmiːdiəm/', example: '', exampleCn: '', options: ['媒介；手段', '回答；回复', '荣幸；尊敬', '真诚地；诚实地'], unit: 7 },
    { word: 'trust', meaning: '信任；相信', phonetic: '/trʌst/', example: '', exampleCn: '', options: ['信任；相信', '开篇的；开始的', '结尾的；结束的', '句子；判决'], unit: 7 },
    { word: 'misunderstanding', meaning: '误解；误会', phonetic: '/ˌmɪsʌndəˈstændɪŋ/', example: '', exampleCn: '', options: ['误解；误会', '费用；价钱', '机会；时机', '对……有用'], unit: 7 },
    { word: 'event', meaning: '公开活动', phonetic: '/ɪˈvent/', example: '', exampleCn: '', options: ['公开活动', '回答；回复', '荣幸；尊敬', '真诚地；诚实地'], unit: 7 },
    { word: 'cost', meaning: '费用；价钱', phonetic: '/kɒst/', example: '', exampleCn: '', options: ['费用；价钱', '开篇的；开始的', '结尾的；结束的', '句子；判决'], unit: 7 },
    { word: 'opportunity', meaning: '机会；时机', phonetic: '/ˌɒpəˈtjuːnəti/', example: '', exampleCn: '', options: ['机会；时机', '日期；日子', '从句；分句', '对……有用'], unit: 7 },
    { word: 'benefit', meaning: '对……有用', phonetic: '/ˈbenɪfɪt/', example: '', exampleCn: '', options: ['对……有用', '句子；判决', '日期；日子', '从句；分句'], unit: 7 },
    { word: 'reply', meaning: '回答；回复', phonetic: '/rɪˈplaɪ/', example: '', exampleCn: '', options: ['回答；回复', '开篇的；开始的', '结尾的；结束的', '句子；判决'], unit: 7 },
    { word: 'honour', meaning: '荣幸；尊敬', phonetic: '/ˈɒnə(r)/', example: '', exampleCn: '', options: ['荣幸；尊敬', '开篇的；开始的', '结尾的；结束的', '句子；判决'], unit: 7 },
    { word: 'sincerely', meaning: '真诚地；诚实地', phonetic: '/sɪnˈsɪəli/', example: '', exampleCn: '', options: ['真诚地；诚实地', '句子；判决', '日期；日子', '从句；分句'], unit: 7 },
    { word: 'opening', meaning: '开篇的；开始的', phonetic: '/ˈəʊpənɪŋ/', example: '', exampleCn: '', options: ['开篇的；开始的', '句子；判决', '日期；日子', '从句；分句'], unit: 7 },
    { word: 'closing', meaning: '结尾的；结束的', phonetic: '/ˈkləʊzɪŋ/', example: '', exampleCn: '', options: ['结尾的；结束的', '句子；判决', '日期；日子', '从句；分句'], unit: 7 },
    { word: 'sentence', meaning: '句子；判决', phonetic: '/ˈsentəns/', example: '', exampleCn: '', options: ['句子；判决', '日期；日子', '从句；分句', '误解；误会'], unit: 7 },
    { word: 'date', meaning: '日期；日子', phonetic: '/deɪt/', example: '', exampleCn: '', options: ['日期；日子', '句子；判决', '从句；分句', '费用；价钱'], unit: 7 },
    { word: 'clause', meaning: '从句；分句', phonetic: '/klɔːz/', example: '', exampleCn: '', options: ['从句；分句', '日期；日子', '句子；判决', '费用；价钱'], unit: 7 },
    { word: 'in person', meaning: '亲自；亲身', phonetic: '', example: '', exampleCn: '', options: ['亲自；亲身', '与……言归于好', '为……担心', '立即；马上'], unit: 7 },
    { word: 'make up', meaning: '与……言归于好', phonetic: '', example: '', exampleCn: '', options: ['与……言归于好', '为……担心', '立即；马上', '给……写信'], unit: 7 },
    { word: 'worry about', meaning: '为……担心', phonetic: '', example: '', exampleCn: '', options: ['为……担心', '立即；马上', '给……写信', '对……表现出兴趣'], unit: 7 },
    { word: 'right away', meaning: '立即；马上', phonetic: '', example: '', exampleCn: '', options: ['立即；马上', '给……写信', '对……表现出兴趣', '与某人争论'], unit: 7 },
    { word: 'drop sb a line', meaning: '给……写信', phonetic: '', example: '', exampleCn: '', options: ['给……写信', '对……表现出兴趣', '与某人争论', '换话题'], unit: 7 },
    { word: 'show interest in', meaning: '对……表现出兴趣', phonetic: '', example: '', exampleCn: '', options: ['对……表现出兴趣', '与某人争论', '换话题', '查明；弄清'], unit: 7 },
    { word: 'argue with sb', meaning: '与某人争论', phonetic: '', example: '', exampleCn: '', options: ['与某人争论', '换话题', '查明；弄清', '注意；关注'], unit: 7 },
    { word: 'move on', meaning: '换话题', phonetic: '', example: '', exampleCn: '', options: ['换话题', '查明；弄清', '注意；关注', '行为自然'], unit: 7 },
    { word: 'find out', meaning: '查明；弄清', phonetic: '', example: '', exampleCn: '', options: ['查明；弄清', '注意；关注', '行为自然', '提供；主动提出'], unit: 7 },
    { word: 'pay attention', meaning: '注意；关注', phonetic: '', example: '', exampleCn: '', options: ['注意；关注', '行为自然', '亲自；亲身', '为……担心'], unit: 7 },
    { word: 'be yourself', meaning: '行为自然', phonetic: '', example: '', exampleCn: '', options: ['行为自然', '亲自；亲身', '与……言归于好', '为……担心'], unit: 7 },
    { word: 'keep away from', meaning: '远离；避免靠近', phonetic: '', example: '', exampleCn: '', options: ['远离；避免靠近', '亲自；亲身', '与……言归于好', '立即；马上'], unit: 7 },
    { word: 'take place', meaning: '发生；进行', phonetic: '', example: '', exampleCn: '', options: ['发生；进行', '从……获益', '亲自；亲身', '远离；避免靠近'], unit: 7 },
    { word: 'benefit from', meaning: '从……获益', phonetic: '', example: '', exampleCn: '', options: ['从……获益', '亲自；亲身', '发生；进行', '远离；避免靠近'], unit: 7 },
    { word: 'face to face', meaning: '面对面', phonetic: '', example: '', exampleCn: '', options: ['面对面', '短信息；短信', '领某人参观', '亲自；亲身'], unit: 7 },
    { word: 'text message', meaning: '短信息；短信', phonetic: '', example: '', exampleCn: '', options: ['短信息；短信', '领某人参观', '面对面', '亲自；亲身'], unit: 7 },
    { word: 'show sb around', meaning: '领某人参观', phonetic: '', example: '', exampleCn: '', options: ['领某人参观', '短信息；短信', '面对面', '亲自；亲身'], unit: 7 },
  ],
  10: [
    { word: 'matter', meaning: 'n. 问题；事情', phonetic: '/ˈmætə(r)/', example: '', exampleCn: '', options: ['n. 绷带 v. 用绷带包扎', 'v. 击；打', 'n. 问题；事情', 'v. 意思是；打算'], unit: 0 },
    { word: 'sore', meaning: 'adj. 疼痛的；酸痛的', phonetic: '/sɔː(r)/', example: '', exampleCn: '', options: ['v. 压；挤；按', 'v. 意思是；打算', 'adj. 疼痛的；酸痛的', 'adv. prep. 离开；不工作'], unit: 0 },
    { word: 'stomachache', meaning: 'n. 胃痛；腹痛', phonetic: '/ˈstʌməkeɪk/', example: '', exampleCn: '', options: ['n. 咽喉；喉咙', 'n. 胃痛；腹痛', 'prep. 向；朝', 'n. 问题；苦恼'], unit: 0 },
    { word: 'foot', meaning: 'n. 脚；足', phonetic: '/fʊt/', example: '', exampleCn: '', options: ['n. 胃；腹部', 'n. 膝；膝盖', 'n. 脚；足', 'adv. prep. 离开；不工作'], unit: 0 },
    { word: 'neck', meaning: 'n. 颈；脖子', phonetic: '/nek/', example: '', exampleCn: '', options: ['n. 颈；脖子', 'n. 头痛', 'v. 意思是；打算', 'n. 跳；脉搏'], unit: 0 },
    { word: 'stomach', meaning: 'n. 胃；腹部', phonetic: '/ˈstʌmək/', example: '', exampleCn: '', options: ['n. 胃；腹部', 'n. 发烧', 'v. 压；挤；按', 'n. 勇气；意志'], unit: 0 },
    { word: 'throat', meaning: 'n. 咽喉；喉咙', phonetic: '/θrəʊt/', example: '', exampleCn: '', options: ['n. v. 咳嗽', 'v. 呼吸', 'n. v. 限制；约束；管理', 'n. 咽喉；喉咙'], unit: 0 },
    { word: 'fever', meaning: 'n. 发烧', phonetic: '/ˈfiːvə(r)/', example: '', exampleCn: '', options: ['n. 发烧', 'n. 间歇；休息', 'n. 死；死亡', 'n. 胸；胸膛'], unit: 0 },
    { word: 'lie', meaning: 'v. 躺；平躺', phonetic: '/laɪ/', example: '', exampleCn: '', options: ['n. 间歇；休息', 'n. 问题；苦恼', 'v. 躺；平躺', 'n. 勇气；意志'], unit: 0 },
    { word: 'rest', meaning: 'v. n. 放松；休息', phonetic: '/rest/', example: '', exampleCn: '', options: ['n. v. 限制；约束；管理', 'n. 胃；腹部', 'n. 乘客；旅客', 'v. n. 放松；休息'], unit: 0 },
    { word: 'cough', meaning: 'n. v. 咳嗽', phonetic: '/kɒf/', example: '', exampleCn: '', options: ['n. v. 咳嗽', 'n. 重要性', 'prep. 向；朝', 'v. 意思是；打算'], unit: 0 },
    { word: 'toothache', meaning: 'n. 牙痛', phonetic: '/ˈtuːθeɪk/', example: '', exampleCn: '', options: ['n. 牙痛', 'n. 间歇；休息', 'n. 死；死亡', 'adj. 生病的；有病的'], unit: 0 },
    { word: 'headache', meaning: 'n. 头痛', phonetic: '/ˈhedeɪk/', example: '', exampleCn: '', options: ['n. 头痛', 'n. 死；死亡', 'v. 疼痛', 'n. v. 咳嗽'], unit: 0 },
    { word: 'break', meaning: 'n. 间歇；休息', phonetic: '/breɪk/', example: '', exampleCn: '', options: ['n. 间歇；休息', 'n. 胃痛；腹痛', 'v. 呼吸', 'adj. 生病的；有病的'], unit: 0 },
    { word: 'hurt', meaning: 'v. 疼痛', phonetic: '/hɜː(r)t/', example: '', exampleCn: '', options: ['v. 疼痛', 'n. 重要性', 'pron. 她自己', 'n. 膝；膝盖'], unit: 0 },
    { word: 'passenger', meaning: 'n. 乘客；旅客', phonetic: '/ˈpæsɪndʒə(r)/', example: '', exampleCn: '', options: ['v. n. 放松；休息', 'n. 乘客；旅客', 'n. 决定；抉择', 'v. 呼吸'], unit: 0 },
    { word: 'off', meaning: 'adv. prep. 离开；不工作', phonetic: '/ɒf/', example: '', exampleCn: '', options: ['adv. prep. 离开；不工作', 'n. 间歇；休息', 'n. 重要性', 'v. 疼痛'], unit: 0 },
    { word: 'onto', meaning: 'prep. 向；朝', phonetic: '/ˈɒntu/', example: '', exampleCn: '', options: ['n. 胃；腹部', 'prep. 向；朝', 'n. 胃痛；腹痛', 'adj. 晒伤的'], unit: 0 },
    { word: 'trouble', meaning: 'n. 问题；苦恼', phonetic: '/ˈtrʌbl/', example: '', exampleCn: '', options: ['n. 问题；苦恼', 'v. 躺；平躺', 'n. 脚；足', 'v. 意思是；打算'], unit: 0 },
    { word: 'hit', meaning: 'v. 击；打', phonetic: '/hɪt/', example: '', exampleCn: '', options: ['v. 击；打', 'n. 颈；脖子', 'n. 重要性', 'n. 脚；足'], unit: 0 },
    { word: 'herself', meaning: 'pron. 她自己', phonetic: '/hɜː(r)ˈself/', example: '', exampleCn: '', options: ['pron. 我们自己', 'pron. 她自己', 'n. 问题；苦恼', 'v. 意思是；打算'], unit: 0 },
    { word: 'bandage', meaning: 'n. 绷带 v. 用绷带包扎', phonetic: '/ˈbændɪdʒ/', example: '', exampleCn: '', options: ['n. 绷带 v. 用绷带包扎', 'v. 躺；平躺', 'v. 击；打', 'n. 重要性'], unit: 0 },
    { word: 'press', meaning: 'v. 压；挤；按', phonetic: '/pres/', example: '', exampleCn: '', options: ['v. 意思是；打算', 'prep. 向；朝', 'v. 压；挤；按', 'v. 疼痛'], unit: 0 },
    { word: 'sick', meaning: 'adj. 生病的；有病的', phonetic: '/sɪk/', example: '', exampleCn: '', options: ['adj. 生病的；有病的', 'n. 死；死亡', 'n. 决定；抉择', 'n. 鼻出血'], unit: 0 },
    { word: 'knee', meaning: 'n. 膝；膝盖', phonetic: '/niː/', example: '', exampleCn: '', options: ['n. 膝；膝盖', 'n. 牙痛', 'n. 间歇；休息', 'n. 重要性'], unit: 0 },
    { word: 'nosebleed', meaning: 'n. 鼻出血', phonetic: '/ˈnəʊzbliːd/', example: '', exampleCn: '', options: ['n. 重要性', 'v. 呼吸', 'n. 鼻出血', 'adj. 生病的；有病的'], unit: 0 },
    { word: 'breathe', meaning: 'v. 呼吸', phonetic: '/briːð/', example: '', exampleCn: '', options: ['v. 躺；平躺', 'v. 呼吸', 'n. 间歇；休息', 'n. 死；死亡'], unit: 0 },
    { word: 'sunburned', meaning: 'adj. 晒伤的', phonetic: '/ˈsʌnbɜː(r)nd/', example: '', exampleCn: '', options: ['adj. 晒伤的', 'n. 膝盖', 'n. 重要性', 'n. v. 咳嗽'], unit: 0 },
    { word: 'ourselves', meaning: 'pron. 我们自己', phonetic: '/ˌaʊə(r)ˈselvz/', example: '', exampleCn: '', options: ['pron. 我们自己', 'v. 击；打', 'prep. 向；朝', 'n. 胃；腹部'], unit: 0 },
    { word: 'climber', meaning: 'n. 登山者；攀登者', phonetic: '/ˈklaɪmə(r)/', example: '', exampleCn: '', options: ['n. 登山者；攀登者', 'pron. 她自己', 'n. 问题；苦恼', 'v. 意思是；打算'], unit: 0 },
    { word: 'risk', meaning: 'n. v. 危险；风险；冒险', phonetic: '/rɪsk/', example: '', exampleCn: '', options: ['n. v. 危险；风险；冒险', 'adj. 生病的；有病的', 'n. 胃痛；腹痛', 'prep. 向；朝'], unit: 0 },
    { word: 'rock', meaning: 'n. 岩石', phonetic: '/rɒk/', example: '', exampleCn: '', options: ['n. 岩石', 'n. 咽喉；喉咙', 'n. 登山者；攀登者', 'n. 胸；胸膛'], unit: 0 },
    { word: 'knife', meaning: 'n. 刀', phonetic: '/naɪf/', example: '', exampleCn: '', options: ['n. 刀', 'adj. 晒伤的', 'n. 重要性', 'n. 鼻出血'], unit: 0 },
    { word: 'blood', meaning: 'n. 血', phonetic: '/blʌd/', example: '', exampleCn: '', options: ['n. 血', 'n. 膝；膝盖', 'n. 胃痛；腹痛', 'n. 咽喉；喉咙'], unit: 0 },
    { word: 'mean', meaning: 'v. 意思是；打算', phonetic: '/miːn/', example: '', exampleCn: '', options: ['v. 意思是；打算', 'n. v. 咳嗽', 'n. v. 限制；约束；管理', 'n. 重要性'], unit: 0 },
    { word: 'importance', meaning: 'n. 重要性', phonetic: '/ɪmˈpɔː(r)tns/', example: '', exampleCn: '', options: ['n. 重要性', 'n. 肋骨；排骨', 'n. 膝盖', 'prep. 向；朝'], unit: 0 },
    { word: 'decision', meaning: 'n. 决定；抉择', phonetic: '/dɪˈsɪʒn/', example: '', exampleCn: '', options: ['n. 决定；抉择', 'n. 声音', 'n. 牙齿', 'pron. 我们自己'], unit: 0 },
    { word: 'control', meaning: 'n. v. 限制；约束；管理', phonetic: '/kənˈtrəʊl/', example: '', exampleCn: '', options: ['n. 岩石', 'n. v. 限制；约束；管理', 'n. 间歇；休息', 'v. 意思是；打算'], unit: 0 },
    { word: 'spirit', meaning: 'n. 勇气；意志', phonetic: '/ˈspɪrɪt/', example: '', exampleCn: '', options: ['n. 勇气；意志', 'n. 重要性', 'v. n. 放松；休息', 'n. 头痛'], unit: 0 },
    { word: 'death', meaning: 'n. 死；死亡', phonetic: '/deθ/', example: '', exampleCn: '', options: ['n. 死；死亡', 'n. 问题；事情', 'n. v. 咳嗽', 'n. 间歇；休息'], unit: 0 },
    { word: 'nurse', meaning: 'n. 护士', phonetic: '/nɜː(r)s/', example: '', exampleCn: '', options: ['n. 护士', 'n. 咽喉；喉咙', 'n. 肋骨；排骨', 'n. 头痛'], unit: 0 },
    { word: 'cheer', meaning: 'v. 欢呼；喝彩', phonetic: '/tʃɪə/', example: '', exampleCn: '', options: ['v. 欢呼；喝彩', 'v. 想象；设想', 'adj. 聪明的；聪颖的', 'n. 女士；小姐'], unit: 1 },
    { word: 'volunteer', meaning: 'v. 义务做 n. 志愿者', phonetic: '/ˌvɒlənˈtɪə/', example: '', exampleCn: '', options: ['v. 义务做 n. 志愿者', 'adj. 聋的', 'n. 夫人；女士', 'v. 修理；修补'], unit: 1 },
    { word: 'sign', meaning: 'n. 标志；信号', phonetic: '/saɪn/', example: '', exampleCn: '', options: ['v. 修理；修补', 'n. 标志；信号', 'adj. 孤独的；寂寞的', 'n. 感觉；感触'], unit: 1 },
    { word: 'notice', meaning: 'n. 通知；通告；注意 v. 注意到', phonetic: '/ˈnəʊtɪs/', example: '', exampleCn: '', options: ['n. 通知；通告；注意 v. 注意到', 'v. 想象；设想', 'adj. 破损的；残缺的', 'n. 高兴；愉快'], unit: 1 },
    { word: 'lonely', meaning: 'adj. 孤独的；寂寞的', phonetic: '/ˈləʊnli/', example: '', exampleCn: '', options: ['adj. 孤独的；寂寞的', 'adj. 激动；兴奋', 'v. 理解；领会', 'adj. 破损的；残缺的'], unit: 1 },
    { word: 'strong', meaning: 'adj. 强烈的；强壮的', phonetic: '/strɒŋ/', example: '', exampleCn: '', options: ['adj. 强烈的；强壮的', 'v. 修理；安装', 'n. 先生', 'adj. 盲的'], unit: 1 },
    { word: 'feeling', meaning: 'n. 感觉；感触', phonetic: '/ˈfiːlɪŋ/', example: '', exampleCn: '', options: ['n. 感觉；感触', 'v. 想象；设想', 'v. 修理；修补', 'v. 修理；安装'], unit: 1 },
    { word: 'satisfaction', meaning: 'n. 满足；满意', phonetic: '/ˌsætɪsˈfækʃn/', example: '', exampleCn: '', options: ['n. 满足；满意', 'n. 高兴；愉快', 'adj. 聋的', 'n. 旅行；行程'], unit: 1 },
    { word: 'joy', meaning: 'n. 高兴；愉快', phonetic: '/dʒɔɪ/', example: '', exampleCn: '', options: ['n. 高兴；愉快', 'n. 物主；主人', 'v. 训练；培训', 'adj. 聪明的；聪颖的'], unit: 1 },
    { word: 'owner', meaning: 'n. 物主；主人', phonetic: '/ˈəʊnə(r)/', example: '', exampleCn: '', options: ['n. 物主；主人', 'adj. 聪明的；聪颖的', 'v. n. 变化；改变', 'v. 训练；培训'], unit: 1 },
    { word: 'journey', meaning: 'n. 旅行；行程', phonetic: '/ˈdʒɜː(r)ni/', example: '', exampleCn: '', options: ['n. 旅行；行程', 'v. 募集；征集', 'adj. 聪明的；聪颖的', 'v. 训练；培训'], unit: 1 },
    { word: 'raise', meaning: 'v. 募集；征集', phonetic: '/reɪz/', example: '', exampleCn: '', options: ['v. 募集；征集', 'adj. 瞎的；失明的', 'v. 修理；安装', 'v. 理解；领会'], unit: 1 },
    { word: 'midnight', meaning: 'n. 午夜；子夜', phonetic: '/ˈmɪdnaɪt/', example: '', exampleCn: '', options: ['n. 午夜；子夜', 'n. 高兴；愉快', 'n. 满足；满意', 'v. n. 变化；改变'], unit: 1 },
    { word: 'repair', meaning: 'v. 修理；修补', phonetic: '/rɪˈpeə/', example: '', exampleCn: '', options: ['v. 修理；修补', 'v. 训练；培训', 'adj. 聋的', 'n. 女士；小姐'], unit: 1 },
    { word: 'fix', meaning: 'v. 修理；安装', phonetic: '/fɪks/', example: '', exampleCn: '', options: ['n. 兴趣；关注', 'v. 修理；安装', 'n. 仁慈；善良', 'n. 先生'], unit: 1 },
    { word: 'broken', meaning: 'adj. 破损的；残缺的', phonetic: '/ˈbrəʊkən/', example: '', exampleCn: '', options: ['adj. 破损的；残缺的', 'v. 理解；领会', 'n. 女士；小姐', 'n. 物主；主人'], unit: 1 },
    { word: 'wheel', meaning: 'n. 车轮；轮子', phonetic: '/wiːl/', example: '', exampleCn: '', options: ['n. 车轮；轮子', 'n. 信；函', 'n. 物主；主人', 'n. 先生'], unit: 1 },
    { word: 'letter', meaning: 'n. 信；函', phonetic: '/ˈletə(r)/', example: '', exampleCn: '', options: ['n. 信；函', 'n. 兴趣；关注', 'v. 想象；设想', 'n. 门'], unit: 1 },
    { word: 'Miss', meaning: 'n. 女士；小姐', phonetic: '/mɪs/', example: '', exampleCn: '', options: ['n. 女士；小姐', 'adj. 聪明的；聪颖的', 'v. 理解；领会', 'n. 门'], unit: 1 },
    { word: 'disabled', meaning: 'adj. 丧失能力的；有残疾的', phonetic: '/dɪsˈeɪbld/', example: '', exampleCn: '', options: ['adj. 丧失能力的；有残疾的', 'n. 午夜；子夜', 'adj. 破损的；残缺的', 'v. 修理；安装'], unit: 1 },
    { word: 'blind', meaning: 'adj. 瞎的；失明的', phonetic: '/blaɪnd/', example: '', exampleCn: '', options: ['adj. 瞎的；失明的', 'n. 高兴；愉快', 'n. 旅行；行程', 'n. 夫人；女士'], unit: 1 },
    { word: 'deaf', meaning: 'adj. 聋的', phonetic: '/def/', example: '', exampleCn: '', options: ['adj. 聋的', 'n. 高兴；愉快', 'v. 开；打开', 'v. 拿；提；扛'], unit: 1 },
    { word: 'imagine', meaning: 'v. 想象；设想', phonetic: '/ɪˈmædʒɪn/', example: '', exampleCn: '', options: ['v. 想象；设想', 'v. 募集；征集', 'v. 训练；培训', 'v. n. 变化；改变'], unit: 1 },
    { word: 'difficulty', meaning: 'n. 困难；难题', phonetic: '/ˈdɪfɪkəlti/', example: '', exampleCn: '', options: ['n. 困难；难题', 'v. 训练；培训', 'n. 先生', 'v. 开；打开'], unit: 1 },
    { word: 'open', meaning: 'v. 开；打开', phonetic: '/ˈəʊpən/', example: '', exampleCn: '', options: ['v. 开；打开', 'v. 欢呼；喝彩', 'adj. 激动的；兴奋的', 'n. 高兴；愉快'], unit: 1 },
    { word: 'door', meaning: 'n. 门', phonetic: '/dɔː(r)/', example: '', exampleCn: '', options: ['n. 门', 'n. 旅行；行程', 'n. 满足；满意', 'n. 兴趣；关注'], unit: 1 },
    { word: 'carry', meaning: 'v. 拿；提；扛', phonetic: '/ˈkæri/', example: '', exampleCn: '', options: ['v. 拿；提；扛', 'v. 修理；安装', 'adj. 孤独的；寂寞的', 'n. 高兴；愉快'], unit: 1 },
    { word: 'train', meaning: 'v. 训练；培训', phonetic: '/treɪn/', example: '', exampleCn: '', options: ['v. 训练；培训', 'v. 想象；设想', 'v. 开；打开', 'adj. 激动的；兴奋的'], unit: 1 },
    { word: 'excited', meaning: 'adj. 激动的；兴奋的', phonetic: '/ɪkˈsaɪtɪd/', example: '', exampleCn: '', options: ['adj. 激动的；兴奋的', 'adj. 聪明的；聪颖的', 'n. 女士；小姐', 'v. 理解；领会'], unit: 1 },
    { word: 'training', meaning: 'n. 训练；培训', phonetic: '/ˈtreɪnɪŋ/', example: '', exampleCn: '', options: ['n. 训练；培训', 'adj. 聪明的；聪颖的', 'n. 夫人；女士', 'n. 仁慈；善良'], unit: 1 },
    { word: 'kindness', meaning: 'n. 仁慈；善良', phonetic: '/ˈkaɪndnəs/', example: '', exampleCn: '', options: ['n. 仁慈；善良', 'adj. 激动的；兴奋的', 'v. 理解；领会', 'n. 信；函'], unit: 1 },
    { word: 'clever', meaning: 'adj. 聪明的；聪颖的', phonetic: '/ˈklevə(r)/', example: '', exampleCn: '', options: ['adj. 聪明的；聪颖的', 'v. 训练；培训', 'n. 先生', 'adj. 激动的；兴奋的'], unit: 1 },
    { word: 'understand', meaning: 'v. 理解；领会', phonetic: '/ˌʌndə(r)ˈstænd/', example: '', exampleCn: '', options: ['v. 理解；领会', 'n. 女士；小姐', 'v. 训练；培训', 'adj. 激动的；兴奋的'], unit: 1 },
    { word: 'change', meaning: 'v. n. 变化；改变', phonetic: '/tʃeɪndʒ/', example: '', exampleCn: '', options: ['v. n. 变化；改变', 'adj. 激动的；兴奋的', 'n. 午夜；子夜', 'v. 理解；领会'], unit: 1 },
    { word: 'interest', meaning: 'n. 兴趣；关注', phonetic: '/ˈɪntrəst/', example: '', exampleCn: '', options: ['n. 兴趣；关注', 'adj. 聪明的；聪颖的', 'n. 训练；培训', 'n. 女士；小姐'], unit: 1 },
    { word: 'sir', meaning: 'n. 先生', phonetic: '/sɜː(r)/', example: '', exampleCn: '', options: ['n. 先生', 'n. 训练；培训', 'n. 仁慈；善良', 'v. 修理；安装'], unit: 1 },
    { word: 'madam', meaning: 'n. 夫人；女士', phonetic: '/ˈmædəm/', example: '', exampleCn: '', options: ['n. 夫人；女士', 'n. 信；函', 'n. 午夜；子夜', 'v. 修理；安装'], unit: 1 },
    { word: 'rubbish', meaning: 'n. 垃圾；废弃物', phonetic: '/ˈrʌbɪʃ/', example: '', exampleCn: '', options: ['n. 垃圾；废弃物', 'v. 借；借用', 'v. 依靠；依赖', 'v. 提供；供应'], unit: 2 },
    { word: 'fold', meaning: 'v. 折叠；对折', phonetic: '/fəʊld/', example: '', exampleCn: '', options: ['v. 扔；掷', 'adv. 也不 pron. 两者都不', 'v. 折叠；对折', 'v. 给；递；走过；通过'], unit: 2 },
    { word: 'sweep', meaning: 'v. 扫；打扫', phonetic: '/swiːp/', example: '', exampleCn: '', options: ['v. 扫；打扫', 'n. 地板', 'v. 依靠；依赖', 'conj. 因为；既然'], unit: 2 },
    { word: 'floor', meaning: 'n. 地板', phonetic: '/flɔː(r)/', example: '', exampleCn: '', options: ['v. 借；借用', 'adj. 有病；不舒服', 'n. 精神压力；心理负担', 'n. 地板'], unit: 2 },
    { word: 'mess', meaning: 'n. 杂乱；不整洁', phonetic: '/mes/', example: '', exampleCn: '', options: ['n. 手指', 'n. 杂乱；不整洁', 'v. 扔；掷', 'n. 精神压力；心理负担'], unit: 2 },
    { word: 'throw', meaning: 'v. 扔；掷', phonetic: '/θrəʊ/', example: '', exampleCn: '', options: ['adj. 合理的；公正的', 'v. 扔；掷', 'v. 折叠；对折', 'v. 借；借用'], unit: 2 },
    { word: 'neither', meaning: 'adv. 也不 pron. 两者都不', phonetic: '/ˈnaɪðə/', example: '', exampleCn: '', options: ['adv. 也不 pron. 两者都不', 'n. 垃圾；废弃物', 'v. 折叠；对折', 'v. 提供；供应'], unit: 2 },
    { word: 'shirt', meaning: 'n. 衬衫', phonetic: '/ʃɜː(r)t/', example: '', exampleCn: '', options: ['v. 借给；借出', 'n. 杂乱；不整洁', 'v. 发展；壮大', 'n. 衬衫'], unit: 2 },
    { word: 'pass', meaning: 'v. 给；递；走过；通过', phonetic: '/pɑːs/', example: '', exampleCn: '', options: ['v. 给；递；走过；通过', 'n. 垃圾；废弃物', 'v. 提供；供应', 'v. 依靠；依赖'], unit: 2 },
    { word: 'tool', meaning: 'n. 工具', phonetic: '/tuːl/', example: '', exampleCn: '', options: ['n. 工具', 'v. 扫；打扫', 'v. 借；借用', 'n. 邻居'], unit: 2 },
    { word: 'borrow', meaning: 'v. 借；借用', phonetic: '/ˈbɒrəʊ/', example: '', exampleCn: '', options: ['v. 借；借用', 'n. 手指', 'v. 扔；掷', 'v. 扫；打扫'], unit: 2 },
    { word: 'lend', meaning: 'v. 借给；借出', phonetic: '/lend/', example: '', exampleCn: '', options: ['v. 借给；借出', 'v. 发展；壮大', 'n. 垃圾；废弃物', 'n. 地板'], unit: 2 },
    { word: 'finger', meaning: 'n. 手指', phonetic: '/ˈfɪŋgə(r)/', example: '', exampleCn: '', options: ['n. 手指', 'v. 扔；掷', 'v. 借；借用', 'conj. 当……的时候；而；然而'], unit: 2 },
    { word: 'chore', meaning: 'n. 杂务', phonetic: '/tʃɔː(r)/', example: '', exampleCn: '', options: ['n. 独立', 'v. 提供；供应', 'n. 公正性；合理性', 'n. 杂务'], unit: 2 },
    { word: 'while', meaning: 'conj. 当……的时候；而；然而', phonetic: '/waɪl/', example: '', exampleCn: '', options: ['conj. 当……的时候；而；然而', 'v. 借；借用', 'v. 提供；供应', 'v. 发展；壮大'], unit: 2 },
    { word: 'snack', meaning: 'n. 点心；小吃；快餐', phonetic: '/snæk/', example: '', exampleCn: '', options: ['n. 点心；小吃；快餐', 'adj. 有病；不舒服', 'conj. 因为；既然', 'v. 依靠；依赖'], unit: 2 },
    { word: 'stress', meaning: 'n. 精神压力；心理负担', phonetic: '/stres/', example: '', exampleCn: '', options: ['n. 精神压力；心理负担', 'v. 提供；供应', 'adj. 合理的；公正的', 'n. 垃圾；废弃物'], unit: 2 },
    { word: 'waste', meaning: 'n. 浪费；垃圾 v. 浪费；滥用', phonetic: '/weɪst/', example: '', exampleCn: '', options: ['n. 浪费；垃圾 v. 浪费；滥用', 'adj. 有病；不舒服', 'adj. 独立的；自主的', 'conj. 因为；既然'], unit: 2 },
    { word: 'provide', meaning: 'v. 提供；供应', phonetic: '/prəˈvaɪd/', example: '', exampleCn: '', options: ['v. 提供；供应', 'v. 扔；掷', 'v. 折叠；对折', 'conj. 因为；既然'], unit: 2 },
    { word: 'anyway', meaning: 'adv. 而且；加之', phonetic: '/ˈeniweɪ/', example: '', exampleCn: '', options: ['adv. 而且；加之', 'conj. 当……的时候；而；然而', 'adv. 也不 pron. 两者都不', 'v. 发展；壮大'], unit: 2 },
    { word: 'depend', meaning: 'v. 依靠；依赖', phonetic: '/dɪˈpend/', example: '', exampleCn: '', options: ['v. 依靠；依赖', 'n. 公正性；合理性', 'n. 点心；小吃；快餐', 'v. 提供；供应'], unit: 2 },
    { word: 'develop', meaning: 'v. 发展；壮大', phonetic: '/dɪˈveləp/', example: '', exampleCn: '', options: ['v. 发展；壮大', 'v. 借给；借出', 'v. 给；递；走过；通过', 'n. 垃圾；废弃物'], unit: 2 },
    { word: 'independence', meaning: 'n. 独立', phonetic: '/ˌɪndɪˈpendəns/', example: '', exampleCn: '', options: ['n. 独立', 'v. 依靠；依赖', 'v. 提供；供应', 'n. 垃圾；废弃物'], unit: 2 },
    { word: 'fairness', meaning: 'n. 公正性；合理性', phonetic: '/ˈfeənəs/', example: '', exampleCn: '', options: ['n. 公正性；合理性', 'v. 扔；掷', 'adj. 合理的；公正的', 'n. 手指'], unit: 2 },
    { word: 'since', meaning: 'conj. 因为；既然', phonetic: '/sɪns/', example: '', exampleCn: '', options: ['conj. 因为；既然', 'n. 点心；小吃；快餐', 'n. 工具', 'v. 发展；壮大'], unit: 2 },
    { word: 'neighbor', meaning: 'n. 邻居', phonetic: '/ˈneɪbə(r)/', example: '', exampleCn: '', options: ['n. 邻居', 'v. 依靠；依赖', 'v. 借给；借出', 'conj. 因为；既然'], unit: 2 },
    { word: 'ill', meaning: 'adj. 有病；不舒服', phonetic: '/ɪl/', example: '', exampleCn: '', options: ['v. 提供；供应', 'adj. 有病；不舒服', 'adj. 独立的；自主的', 'adj. 合理的；公正的'], unit: 2 },
    { word: 'drop', meaning: 'v. 落下；掉下', phonetic: '/drɒp/', example: '', exampleCn: '', options: ['v. 落下；掉下', 'v. 提供；供应', 'v. 发展；壮大', 'adv. 也不 pron. 两者都不'], unit: 2 },
    { word: 'independent', meaning: 'adj. 独立的；自主的', phonetic: '/ˌɪndɪˈpendənt/', example: '', exampleCn: '', options: ['adj. 独立的；自主的', 'n. 工具', 'v. 扫；打扫', 'v. 发展；壮大'], unit: 2 },
    { word: 'fair', meaning: 'adj. 合理的；公正的', phonetic: '/feə/', example: '', exampleCn: '', options: ['adj. 合理的；公正的', 'v. 借给；借出', 'v. 扫；打扫', 'conj. 当……的时候；而；然而'], unit: 2 },
    { word: 'unfair', meaning: 'adj. 不合理的；不公正的', phonetic: '/ˌʌnˈfeə/', example: '', exampleCn: '', options: ['adj. 不合理的；不公正的', 'v. 给；递；走过；通过', 'n. 精神压力；心理负担', 'n. 手指'], unit: 2 },
    { word: 'allow', meaning: 'v. 允许；准许', phonetic: '/əˈlaʊ/', example: '', exampleCn: '', options: ['v. 允许；准许', 'n. 协议；交易', 'v. 猜测；估计', 'n. 意见；想法；看法'], unit: 3 },
    { word: 'wrong', meaning: 'adj. 有毛病；错误的', phonetic: '/rɒŋ/', example: '', exampleCn: '', options: ['adj. 有毛病；错误的', 'n. 关系；联系；交往', 'adj. 年纪较长的', 'adv. 代替；反而'], unit: 3 },
    { word: 'guess', meaning: 'v. 猜测；估计', phonetic: '/ges/', example: '', exampleCn: '', options: ['v. 猜测；估计', 'n. 云；云朵', 'v. 解释；说明', 'n. 成员；分子'], unit: 3 },
    { word: 'deal', meaning: 'n. 协议；交易', phonetic: '/diːl/', example: '', exampleCn: '', options: ['n. 协议；交易', 'adv. 代替；反而', 'adv. 第二；其次', 'v. 解释；说明'], unit: 3 },
    { word: 'relation', meaning: 'n. 关系；联系；交往', phonetic: '/rɪˈleɪʃn/', example: '', exampleCn: '', options: ['n. 关系；联系；交往', 'adj. 有毛病；错误的', 'adj. 焦虑的；担忧的', 'adj. 年纪较长的'], unit: 3 },
    { word: 'communication', meaning: 'n. 交流；沟通', phonetic: '/kəˌmjuːnɪˈkeɪʃn/', example: '', exampleCn: '', options: ['n. 交流；沟通', 'v. 归还；回来；返回', 'v. 持续；继续存在', 'adj. 快的；迅速的'], unit: 3 },
    { word: 'argue', meaning: 'v. 争吵；争论', phonetic: '/ˈɑː(r)ɡjuː/', example: '', exampleCn: '', options: ['v. 争吵；争论', 'v. 造成；引起', 'v. 归还；回来；返回', 'n. 意见；想法；看法'], unit: 3 },
    { word: 'cloud', meaning: 'n. 云；云朵', phonetic: '/klaʊd/', example: '', exampleCn: '', options: ['v. 持续；继续存在', 'n. 云；云朵', 'v. 比较', 'n. 交流；沟通'], unit: 3 },
    { word: 'elder', meaning: 'adj. 年纪较长的', phonetic: '/ˈeldə(r)/', example: '', exampleCn: '', options: ['adj. 年纪较长的', 'adj. 焦虑的；担忧的', 'n. 关系；联系；交往', 'v. 解释；说明'], unit: 3 },
    { word: 'instead', meaning: 'adv. 代替；反而', phonetic: '/ɪnˈsted/', example: '', exampleCn: '', options: ['adv. 代替；反而', 'v. 抄袭；模仿；复制；复印', 'v. 造成；引起', 'adj. 快的；迅速的'], unit: 3 },
    { word: 'whatever', meaning: 'pron. 任何；每一', phonetic: '/wɒtˈevə/', example: '', exampleCn: '', options: ['pron. 任何；每一', 'v. 猜测；估计', 'v. 争吵；争论', 'v. 比较'], unit: 3 },
    { word: 'nervous', meaning: 'adj. 焦虑的；担忧的', phonetic: '/ˈnɜː(r)vəs/', example: '', exampleCn: '', options: ['adj. 焦虑的；担忧的', 'n. 交流；沟通', 'n. 压力', 'adj. 快的；迅速的'], unit: 3 },
    { word: 'offer', meaning: 'v. 主动提出；自愿给予', phonetic: '/ˈɒfə/', example: '', exampleCn: '', options: ['v. 主动提出；自愿给予', 'v. 比较', 'adj. 正确的；恰当的', 'n. 发展；发育；成长'], unit: 3 },
    { word: 'proper', meaning: 'adj. 正确的；恰当的', phonetic: '/ˈprɒpə/', example: '', exampleCn: '', options: ['adj. 正确的；恰当的', 'v. 持续；继续存在', 'adj. 快的；迅速的', 'v. 比较'], unit: 3 },
    { word: 'secondly', meaning: 'adv. 第二；其次', phonetic: '/ˈsekəndli/', example: '', exampleCn: '', options: ['adv. 第二；其次', 'adj. 快的；迅速的', 'v. 解释；说明', 'v. 争吵；争论'], unit: 3 },
    { word: 'communicate', meaning: 'v. 交流；沟通', phonetic: '/kəˈmjuːnɪkeɪt/', example: '', exampleCn: '', options: ['v. 交流；沟通', 'n. 发展；发育；成长', 'adj. 不理智的；疯狂的', 'adj. 焦虑的；担忧的'], unit: 3 },
    { word: 'explain', meaning: 'v. 解释；说明', phonetic: '/ɪkˈspleɪn/', example: '', exampleCn: '', options: ['v. 解释；说明', 'v. 比较', 'adj. 不理智的；疯狂的', 'n. 交流；沟通'], unit: 3 },
    { word: 'copy', meaning: 'v. 抄袭；模仿；复制；复印', phonetic: '/ˈkɒpi/', example: '', exampleCn: '', options: ['v. 抄袭；模仿；复制；复印', 'v. 允许；准许', 'adj. 焦虑的；担忧的', 'v. 比较'], unit: 3 },
    { word: 'return', meaning: 'v. 归还；回来；返回', phonetic: '/rɪˈtɜː(r)n/', example: '', exampleCn: '', options: ['v. 归还；回来；返回', 'v. 允许；准许', 'n. 压力', 'adj. 正确的；恰当的'], unit: 3 },
    { word: 'anymore', meaning: 'adv. 再也（不）；（不）再', phonetic: '/ˌeniˈmɔː(r)/', example: '', exampleCn: '', options: ['adv. 再也（不）；（不）再', 'adv. 第二；其次', 'n. 交流；沟通', 'v. 抄袭；模仿；复制；复印'], unit: 3 },
    { word: 'member', meaning: 'n. 成员；分子', phonetic: '/ˈmembə(r)/', example: '', exampleCn: '', options: ['n. 成员；分子', 'v. 猜测；估计', 'n. 云；云朵', 'adv. 第二；其次'], unit: 3 },
    { word: 'pressure', meaning: 'n. 压力', phonetic: '/ˈpreʃə(r)/', example: '', exampleCn: '', options: ['n. 压力', 'v. 允许；准许', 'n. 发展；发育；成长', 'adj. 焦虑的；担忧的'], unit: 3 },
    { word: 'compete', meaning: 'v. 竞争；对抗', phonetic: '/kəmˈpiːt/', example: '', exampleCn: '', options: ['v. 竞争；对抗', 'v. 造成；引起', 'adj. 正确；恰当', 'v. 主动提出；自愿给予'], unit: 3 },
    { word: 'opinion', meaning: 'n. 意见；想法；看法', phonetic: '/əˈpɪnjən/', example: '', exampleCn: '', options: ['n. 意见；想法；看法', 'n. 压力', 'adj. 不理智的；疯狂的', 'adj. 快的；迅速的'], unit: 3 },
    { word: 'push', meaning: 'v. 鞭策；督促；推动', phonetic: '/pʊʃ/', example: '', exampleCn: '', options: ['v. 鞭策；督促；推动', 'n. 交流；沟通', 'adj. 有毛病；错误的', 'adj. 通常的；寻常的'], unit: 3 },
    { word: 'skill', meaning: 'n. 技艺；技巧', phonetic: '/skɪl/', example: '', exampleCn: '', options: ['n. 技艺；技巧', 'n. 成员；分子', 'v. 比较', 'v. 争吵；争论'], unit: 3 },
    { word: 'typical', meaning: 'adj. 典型的', phonetic: '/ˈtɪpɪkl/', example: '', exampleCn: '', options: ['adj. 典型的', 'adj. 正确的；恰当的', 'v. 持续；继续存在', 'v. 比较'], unit: 3 },
    { word: 'football', meaning: 'n. 橄榄球；足球', phonetic: '/ˈfʊtbɔːl/', example: '', exampleCn: '', options: ['v. 鞭策；督促；推动', 'n. 橄榄球；足球', 'adj. 年纪较长的', 'v. 归还；回来；返回'], unit: 3 },
    { word: 'quick', meaning: 'adj. 快的；迅速的', phonetic: '/kwɪk/', example: '', exampleCn: '', options: ['adj. 快的；迅速的', 'adv. 再也（不）；（不）再', 'adv. 也许', 'adj. 正确的；恰当的'], unit: 3 },
    { word: 'continue', meaning: 'v. 持续；继续存在', phonetic: '/kənˈtɪnjuː/', example: '', exampleCn: '', options: ['v. 持续；继续存在', 'v. 造成；引起', 'n. 发展；发育；成长', 'v. 解释；说明'], unit: 3 },
    { word: 'compare', meaning: 'v. 比较', phonetic: '/kəmˈpeə/', example: '', exampleCn: '', options: ['v. 比较', 'v. 允许；准许', 'adj. 焦虑的；担忧的', 'adv. 第二；其次'], unit: 3 },
    { word: 'crazy', meaning: 'adj. 不理智的；疯狂的', phonetic: '/ˈkreɪzi/', example: '', exampleCn: '', options: ['adj. 不理智的；疯狂的', 'adj. 快的；迅速的', 'v. 持续；继续存在', 'v. 解释；说明'], unit: 3 },
    { word: 'development', meaning: 'n. 发展；发育；成长', phonetic: '/dɪˈveləpmənt/', example: '', exampleCn: '', options: ['n. 发展；发育；成长', 'v. 持续；继续存在', 'adv. 第二；其次', 'v. 主动提出；自愿给予'], unit: 3 },
    { word: 'cause', meaning: 'v. 造成；引起', phonetic: '/kɔːz/', example: '', exampleCn: '', options: ['v. 造成；引起', 'adj. 通常的；寻常的', 'adj. 不理智的；疯狂的', 'adv. 再也（不）；（不）再'], unit: 3 },
    { word: 'usual', meaning: 'adj. 通常的；寻常的', phonetic: '/ˈjuːʒuəl/', example: '', exampleCn: '', options: ['adj. 通常的；寻常的', 'v. 主动提出；自愿给予', 'v. 比较', 'n. 压力'], unit: 3 },
    { word: 'perhaps', meaning: 'adv. 也许', phonetic: '/pə(r)ˈhæps/', example: '', exampleCn: '', options: ['adv. 也许', 'v. 抄袭；模仿；复制；复印', 'adv. 第二；其次', 'v. 比较'], unit: 3 },
    { word: 'rainstorm', meaning: 'n. 暴风雨', phonetic: '/ˈreɪnstɔː(r)m/', example: '', exampleCn: '', options: ['n. 暴风雨', 'adj. 奇特的；奇怪的', 'adj. 倒下的；落下的', 'n. 手电筒'], unit: 4 },
    { word: 'alarm', meaning: 'n. 闹钟；响声', phonetic: '/əˈlɑː(r)m/', example: '', exampleCn: '', options: ['n. 光；光线；光亮', 'n. 闹钟；响声', 'n. 地域；地区', 'n. 章节；段落'], unit: 4 },
    { word: 'begin', meaning: 'v. 开始', phonetic: '/bɪˈɡɪn/', example: '', exampleCn: '', options: ['v. 开始', 'adj. 睡着', 'n. 光；光线；光亮', 'adv. 突然；忽然'], unit: 4 },
    { word: 'heavily', meaning: 'adv. 在很大程度上；大量地', phonetic: '/ˈhevɪli/', example: '', exampleCn: '', options: ['adv. 在很大程度上；大量地', 'adv. 彻底地；完全地', 'adj. 惊愕的；受震惊的', 'v. n. 升起；增加；提高'], unit: 4 },
    { word: 'suddenly', meaning: 'adv. 突然；忽然', phonetic: '/ˈsʌdənli/', example: '', exampleCn: '', options: ['adv. 突然；忽然', 'v. n. 报道；公布', 'n. 地域；地区', 'n. 沉默；缄默；无声'], unit: 4 },
    { word: 'strange', meaning: 'adj. 奇特的；奇怪的', phonetic: '/streɪndʒ/', example: '', exampleCn: '', options: ['adj. 奇特的；奇怪的', 'v. 理解；领会；认识到', 'n. 木；木头', 'adj. 惊愕的；受震惊的'], unit: 4 },
    { word: 'storm', meaning: 'n. 暴风雨', phonetic: '/stɔː(r)m/', example: '', exampleCn: '', options: ['n. 暴风雨', 'n. 章节；段落', 'n. 学生', 'n. 沉默；缄默；无声'], unit: 4 },
    { word: 'wind', meaning: 'n. 风', phonetic: '/wɪnd/', example: '', exampleCn: '', options: ['adv. 分离；分开', 'n. 窗；窗户', 'n. 风', 'adj. 覆盖着冰的；冰冷的'], unit: 4 },
    { word: 'light', meaning: 'n. 光；光线；光亮', phonetic: '/laɪt/', example: '', exampleCn: '', options: ['n. 光；光线；光亮', 'n. 学生', 'adj. 奇特的；奇怪的', 'v. 开玩笑；欺骗'], unit: 4 },
    { word: 'report', meaning: 'v. n. 报道；公布', phonetic: '/rɪˈpɔː(r)t/', example: '', exampleCn: '', options: ['v. n. 报道；公布', 'n. 窗；窗户', 'n. 风', 'n. 火柴'], unit: 4 },
    { word: 'area', meaning: 'n. 地域；地区', phonetic: '/ˈeəriə/', example: '', exampleCn: '', options: ['n. 地域；地区', 'adv. 分离；分开', 'n. 暴风雨', 'adv. 在很大程度上；大量地'], unit: 4 },
    { word: 'wood', meaning: 'n. 木；木头', phonetic: '/wʊd/', example: '', exampleCn: '', options: ['n. 木；木头', 'n. 塔；塔楼', 'prep. 朝；向；对着', 'adv. 不久前；最近'], unit: 4 },
    { word: 'window', meaning: 'n. 窗；窗户', phonetic: '/ˈwɪndəʊ/', example: '', exampleCn: '', options: ['n. 窗；窗户', 'adj. 惊愕的；受震惊的', 'n. 沉默；缄默；无声', 'n. 学生'], unit: 4 },
    { word: 'flashlight', meaning: 'n. 手电筒', phonetic: '/ˈflæʃlaɪt/', example: '', exampleCn: '', options: ['n. 手电筒', 'n. 恐怖主义者；恐怖分子', 'v. n. 报道；公布', 'n. 火柴'], unit: 4 },
    { word: 'match', meaning: 'n. 火柴', phonetic: '/mætʃ/', example: '', exampleCn: '', options: ['n. 火柴', 'v. 开玩笑；欺骗', 'adj. 惊愕的；受震惊的', 'n. 学生'], unit: 4 },
    { word: 'beat', meaning: 'v. 敲打；打败', phonetic: '/biːt/', example: '', exampleCn: '', options: ['v. 敲打；打败', 'v. n. 报道；公布', 'adj. 覆盖着冰的；冰冷的', 'n. 窗；窗户'], unit: 4 },
    { word: 'against', meaning: 'prep. 倚；碰；撞', phonetic: '/əˈɡenst/', example: '', exampleCn: '', options: ['prep. 倚；碰；撞', 'adv. 突然；忽然', 'n. 风', 'n. 章节；段落'], unit: 4 },
    { word: 'asleep', meaning: 'adj. 睡着', phonetic: '/əˈsliːp/', example: '', exampleCn: '', options: ['adj. 睡着', 'prep. 朝；向；对着', 'n. 地域；地区', 'adj. 惊愕的；受震惊的'], unit: 4 },
    { word: 'rise', meaning: 'v. n. 升起；增加；提高', phonetic: '/raɪz/', example: '', exampleCn: '', options: ['v. n. 升起；增加；提高', 'n. 学生', 'prep. 朝；向；对着', 'n. 沉默；缄默；无声'], unit: 4 },
    { word: 'fallen', meaning: 'adj. 倒下的；落下的', phonetic: '/ˈfɔːlən/', example: '', exampleCn: '', options: ['adj. 倒下的；落下的', 'adj. 睡着', 'n. 恐怖主义者；恐怖分子', 'prep. 朝；向；对着'], unit: 4 },
    { word: 'apart', meaning: 'adv. 分离；分开', phonetic: '/əˈpɑː(r)t/', example: '', exampleCn: '', options: ['adv. 分离；分开', 'n. 火柴', 'prep. 倚；碰；撞', 'v. 理解；领会；认识到'], unit: 4 },
    { word: 'towards', meaning: 'prep. 朝；向；对着', phonetic: '/təˈwɔːdz/', example: '', exampleCn: '', options: ['prep. 朝；向；对着', 'n. 塔；塔楼', 'v. 开始', 'n. 恐怖主义者；恐怖分子'], unit: 4 },
    { word: 'icy', meaning: 'adj. 覆盖着冰的；冰冷的', phonetic: '/ˈaɪsi/', example: '', exampleCn: '', options: ['adj. 覆盖着冰的；冰冷的', 'adv. 在一定程度上', 'adj. 睡着', 'n. 手电筒'], unit: 4 },
    { word: 'kid', meaning: 'v. 开玩笑；欺骗', phonetic: '/kɪd/', example: '', exampleCn: '', options: ['v. 开玩笑；欺骗', 'prep. 倚；碰；撞', 'n. 塔；塔楼', 'adj. 覆盖着冰的；冰冷的'], unit: 4 },
    { word: 'realize', meaning: 'v. 理解；领会；认识到', phonetic: '/ˈriəlaɪz/', example: '', exampleCn: '', options: ['v. 理解；领会；认识到', 'v. n. 升起；增加；提高', 'v. 开始', 'n. 学生'], unit: 4 },
    { word: 'passage', meaning: 'n. 章节；段落', phonetic: '/ˈpæsɪdʒ/', example: '', exampleCn: '', options: ['n. 章节；段落', 'n. 日期；日子', 'n. 暴风雨', 'n. 风'], unit: 4 },
    { word: 'pupil', meaning: 'n. 学生', phonetic: '/ˈpjuːpl/', example: '', exampleCn: '', options: ['n. 学生', 'adv. 在很大程度上；大量地', 'adj. 睡着', 'n. 窗；窗户'], unit: 4 },
    { word: 'completely', meaning: 'adv. 彻底地；完全地', phonetic: '/kəmˈpliːtli/', example: '', exampleCn: '', options: ['adv. 彻底地；完全地', 'n. 恐怖主义者；恐怖分子', 'n. 手电筒', 'n. 地域；地区'], unit: 4 },
    { word: 'shocked', meaning: 'adj. 惊愕的；受震惊的', phonetic: '/ʃɒkt/', example: '', exampleCn: '', options: ['adj. 惊愕的；受震惊的', 'n. 火柴', 'n. 暴风雨', 'adj. 覆盖着冰的；冰冷的'], unit: 4 },
    { word: 'silence', meaning: 'n. 沉默；缄默；无声', phonetic: '/ˈsaɪləns/', example: '', exampleCn: '', options: ['n. 沉默；缄默；无声', 'adj. 倒下的；落下的', 'prep. 朝；向；对着', 'v. 开始'], unit: 4 },
    { word: 'recently', meaning: 'adv. 不久前；最近', phonetic: '/ˈriːsntli/', example: '', exampleCn: '', options: ['adv. 不久前；最近', 'adj. 奇特的；奇怪的', 'prep. 倚；碰；撞', 'n. 恐怖主义者；恐怖分子'], unit: 4 },
    { word: 'terrorist', meaning: 'n. 恐怖主义者；恐怖分子', phonetic: '/ˈterərɪst/', example: '', exampleCn: '', options: ['n. 恐怖主义者；恐怖分子', 'n. 风', 'n. 手电筒', 'adj. 奇特的；奇怪的'], unit: 4 },
    { word: 'date', meaning: 'n. 日期；日子', phonetic: '/deɪt/', example: '', exampleCn: '', options: ['n. 日期；日子', 'n. 沉默；缄默；无声', 'n. 窗；窗户', 'adj. 睡着'], unit: 4 },
    { word: 'tower', meaning: 'n. 塔；塔楼', phonetic: '/ˈtaʊə(r)/', example: '', exampleCn: '', options: ['n. 塔；塔楼', 'adj. 倒下的；落下的', 'n. 木；木头', 'adv. 突然；忽然'], unit: 4 },
    { word: 'gold', meaning: 'n. 金子；金币 adj. 金色的', phonetic: '/ɡəʊld/', example: '', exampleCn: '', options: ['n. 金子；金币 adj. 金色的', 'v. 欺骗；蒙骗 n. 骗子', 'n. 月光', 'n. 妻子；太太'], unit: 5 },
    { word: 'emperor', meaning: 'n. 皇帝', phonetic: '/ˈempərə(r)/', example: '', exampleCn: '', options: ['n. 皇帝', 'n. 声音', 'n. 地；地面', 'adj. 全部的；整体的'], unit: 5 },
    { word: 'silk', meaning: 'n. 丝绸；丝织物', phonetic: '/sɪlk/', example: '', exampleCn: '', options: ['n. 丝绸；丝织物', 'adv. 光亮地；明亮地 adj. 明亮的', 'adj. 勇敢的；无畏的', 'n. 继母'], unit: 5 },
    { word: 'underwear', meaning: 'n. 内衣', phonetic: '/ˈʌndəweə/', example: '', exampleCn: '', options: ['n. 内衣', 'n. 场；场景', 'n. 皇帝', 'n. 勇士'], unit: 5 },
    { word: 'nobody', meaning: 'pron. 没有人 n. 小人物', phonetic: '/ˈnəʊbədi/', example: '', exampleCn: '', options: ['pron. 没有人 n. 小人物', 'v. 发光；照耀', 'v. 欺骗；蒙骗 n. 骗子', 'n. 月光'], unit: 5 },
    { word: 'stupid', meaning: 'adj. 愚蠢的', phonetic: '/ˈstjuːpɪd/', example: '', exampleCn: '', options: ['adj. 愚蠢的', 'n. 皇帝', 'n. 丝绸；丝织物', 'v. 欺骗；蒙骗 n. 骗子'], unit: 5 },
    { word: 'cheat', meaning: 'v. 欺骗；蒙骗 n. 骗子', phonetic: '/tʃiːt/', example: '', exampleCn: '', options: ['v. 欺骗；蒙骗 n. 骗子', 'v. 带路；领路', 'adj. 勇敢的；无畏的', 'n. 皇帝'], unit: 5 },
    { word: 'stepmother', meaning: 'n. 继母', phonetic: '/ˈstepmʌðə(r)/', example: '', exampleCn: '', options: ['n. 继母', 'n. 内衣', 'v. 欺骗；蒙骗 n. 骗子', 'adj. 愚蠢的'], unit: 5 },
    { word: 'wife', meaning: 'n. 妻子；太太', phonetic: '/waɪf/', example: '', exampleCn: '', options: ['n. 妻子；太太', 'pron. 没有人 n. 小人物', 'n. 场；场景', 'n. 声音'], unit: 5 },
    { word: 'husband', meaning: 'n. 丈夫', phonetic: '/ˈhʌzbənd/', example: '', exampleCn: '', options: ['n. 丈夫', 'n. 内衣', 'adv. 光亮地；明亮地 adj. 明亮的', 'n. 地；地面'], unit: 5 },
    { word: 'whole', meaning: 'adj. 全部的；整体的', phonetic: '/həʊl/', example: '', exampleCn: '', options: ['adj. 全部的；整体的', 'n. 皇帝', 'n. 月亮', 'n. 声音'], unit: 5 },
    { word: 'scene', meaning: 'n. 场；场景', phonetic: '/siːn/', example: '', exampleCn: '', options: ['n. 场；场景', 'adj. 全部的；整体的', 'n. 地；地面', 'pron. 没有人 n. 小人物'], unit: 5 },
    { word: 'moonlight', meaning: 'n. 月光', phonetic: '/ˈmuːnlaɪt/', example: '', exampleCn: '', options: ['n. 月光', 'v. 发光；照耀', 'n. 声音', 'adj. 全部的；整体的'], unit: 5 },
    { word: 'shine', meaning: 'v. 发光；照耀', phonetic: '/ʃaɪn/', example: '', exampleCn: '', options: ['v. 发光；照耀', 'n. 丈夫', 'v. 带路；领路', 'n. 地；地面'], unit: 5 },
    { word: 'bright', meaning: 'adv. 光亮地；明亮地 adj. 明亮的', phonetic: '/braɪt/', example: '', exampleCn: '', options: ['adv. 光亮地；明亮地 adj. 明亮的', 'adj. 全部的；整体的', 'n. 皇帝', 'n. 内衣'], unit: 5 },
    { word: 'ground', meaning: 'n. 地；地面', phonetic: '/ɡraʊnd/', example: '', exampleCn: '', options: ['n. 地；地面', 'v. 带路；领路', 'n. 月光', 'adj. 愚蠢的'], unit: 5 },
    { word: 'lead', meaning: 'v. 带路；领路', phonetic: '/liːd/', example: '', exampleCn: '', options: ['v. 带路；领路', 'v. 发光；照耀', 'n. 丈夫', 'n. 妻子；太太'], unit: 5 },
    { word: 'voice', meaning: 'n. 声音', phonetic: '/vɔɪs/', example: '', exampleCn: '', options: ['n. 声音', 'n. 场；场景', 'adj. 勇敢的；无畏的', 'n. 皇帝'], unit: 5 },
    { word: 'brave', meaning: 'adj. 勇敢的；无畏的', phonetic: '/breɪv/', example: '', exampleCn: '', options: ['adj. 勇敢的；无畏的', 'n. 继母', 'adv. 光亮地；明亮地 adj. 明亮的', 'v. 带路；领路'], unit: 5 },
    { word: 'square', meaning: 'adj. 平方；正方形的 n. 正方形；广场', phonetic: '/skweə/', example: '', exampleCn: '', options: ['adj. 平方；正方形的 n. 正方形；广场', 'adj. 极冷的；冰冻的', 'v. 重量是……', 'n. 激动；兴奋'], unit: 6 },
    { word: 'meter', meaning: 'n. 米；公尺', phonetic: '/ˈmiːtə(r)/', example: '', exampleCn: '', options: ['n. 米；公尺', 'v. 保护；防护', 'n. 竹子', 'adj. 醒着'], unit: 6 },
    { word: 'deep', meaning: 'adj. 深的；纵深的', phonetic: '/diːp/', example: '', exampleCn: '', options: ['adj. 深的；纵深的', 'n. 旅行者；观光者', 'n. 条件；状况', 'adj. 平方；正方形的 n. 正方形；广场'], unit: 6 },
    { word: 'desert', meaning: 'n. 沙漠', phonetic: '/ˈdezə(r)t/', example: '', exampleCn: '', options: ['n. 沙漠', 'v. 包括；包含', 'n. 力；力量', 'n. 大海；海洋'], unit: 6 },
    { word: 'tour', meaning: 'n. v. 旅行；旅游', phonetic: '/tʊə/', example: '', exampleCn: '', options: ['n. v. 旅行；旅游', 'n. 墙', 'v. n. 挑战；考验', 'adj. 古代的；古老的'], unit: 6 },
    { word: 'tourist', meaning: 'n. 旅行者；观光者', phonetic: '/ˈtʊərɪst/', example: '', exampleCn: '', options: ['n. 旅行者；观光者', 'adj. 令人大为惊奇的', 'n. 沙漠', 'n. 油；食用油；石油'], unit: 6 },
    { word: 'wall', meaning: 'n. 墙', phonetic: '/wɔːl/', example: '', exampleCn: '', options: ['n. 墙', 'n. 旅行者；观光者', 'adj. 宽的；宽阔的', 'v. 实现目标；成功'], unit: 6 },
    { word: 'amazing', meaning: 'adj. 令人大为惊奇的', phonetic: '/əˈmeɪzɪŋ/', example: '', exampleCn: '', options: ['adj. 令人大为惊奇的', 'n. v. 研究；调查', 'v. 包括；包含', 'v. n. 挑战；考验'], unit: 6 },
    { word: 'ancient', meaning: 'adj. 古代的；古老的', phonetic: '/ˈeɪnʃənt/', example: '', exampleCn: '', options: ['adj. 古代的；古老的', 'n. 米；公尺', 'n. 饲养员；保管人', 'n. 激动；兴奋'], unit: 6 },
    { word: 'protect', meaning: 'v. 保护；防护', phonetic: '/prəˈtekt/', example: '', exampleCn: '', options: ['v. 保护；防护', 'n. 力；力量', 'adj. 深的；纵深的', 'adj. 成年的 n. 成人'], unit: 6 },
    { word: 'wide', meaning: 'adj. 宽的；宽阔的', phonetic: '/waɪd/', example: '', exampleCn: '', options: ['adj. 宽的；宽阔的', 'adj. 西南的', 'v. 达到；完成；成功', 'n. 出生；诞生'], unit: 6 },
    { word: 'achievement', meaning: 'n. 成就；成绩', phonetic: '/əˈtʃiːvmənt/', example: '', exampleCn: '', options: ['n. 成就；成绩', 'n. 墙', 'adj. 厚的；浓的', 'v. 达到；完成；成功'], unit: 6 },
    { word: 'southwestern', meaning: 'adj. 西南的', phonetic: '/ˌsaʊθˈwestə(r)n/', example: '', exampleCn: '', options: ['adj. 西南的', 'n. 油；食用油；石油', 'adj. 宽的；宽阔的', 'n. 饲养员；保管人'], unit: 6 },
    { word: 'thick', meaning: 'adj. 厚的；浓的', phonetic: '/θɪk/', example: '', exampleCn: '', options: ['adj. 厚的；浓的', 'v. 达到；完成；成功', 'adj. 令人大为惊奇的', 'n. 激动；兴奋'], unit: 6 },
    { word: 'include', meaning: 'v. 包括；包含', phonetic: '/ɪnˈkluːd/', example: '', exampleCn: '', options: ['v. 包括；包含', 'n. 大海；海洋', 'adj. 极冷的；冰冻的', 'n. 油；食用油；石油'], unit: 6 },
    { word: 'freezing', meaning: 'adj. 极冷的；冰冻的', phonetic: '/ˈfriːzɪŋ/', example: '', exampleCn: '', options: ['adj. 极冷的；冰冻的', 'n. 自然界；大自然', 'n. v. 研究；调查', 'adj. 低的'], unit: 6 },
    { word: 'condition', meaning: 'n. 条件；状况', phonetic: '/kənˈdɪʃn/', example: '', exampleCn: '', options: ['n. 条件；状况', 'n. 大海；海洋', 'n. 油；食用油；石油', 'n. 出生；诞生'], unit: 6 },
    { word: 'succeed', meaning: 'v. 实现目标；成功', phonetic: '/səkˈsiːd/', example: '', exampleCn: '', options: ['v. 实现目标；成功', 'v. 保护；防护', 'adj. 宽的；宽阔的', 'n. v. 旅行；旅游'], unit: 6 },
    { word: 'challenge', meaning: 'v. n. 挑战；考验', phonetic: '/ˈtʃælɪndʒ/', example: '', exampleCn: '', options: ['v. n. 挑战；考验', 'adj. 西南的', 'v. 保护；防护', 'n. 米；公尺'], unit: 6 },
    { word: 'achieve', meaning: 'v. 达到；完成；成功', phonetic: '/əˈtʃiːv/', example: '', exampleCn: '', options: ['v. 达到；完成；成功', 'adj. 厚的；浓的', 'adj. 极冷的；冰冻的', 'v. 实现目标；成功'], unit: 6 },
    { word: 'force', meaning: 'n. 力；力量', phonetic: '/fɔː(r)s/', example: '', exampleCn: '', options: ['n. 力；力量', 'n. 出生；诞生', 'v. 保护；防护', 'n. 竹子'], unit: 6 },
    { word: 'nature', meaning: 'n. 自然界；大自然', phonetic: '/ˈneɪtʃə(r)/', example: '', exampleCn: '', options: ['n. 自然界；大自然', 'adj. 濒危的', 'n. 墙', 'adj. 令人大为惊奇的'], unit: 6 },
    { word: 'ocean', meaning: 'n. 大海；海洋', phonetic: '/ˈəʊʃn/', example: '', exampleCn: '', options: ['n. 大海；海洋', 'v. 重量是……', 'adj. 深的；纵深的', 'n. 饲养员；保管人'], unit: 6 },
    { word: 'weigh', meaning: 'v. 重量是……', phonetic: '/weɪ/', example: '', exampleCn: '', options: ['v. 重量是……', 'n. 成就；成绩', 'n. 条件；状况', 'v. 达到；完成；成功'], unit: 6 },
    { word: 'birth', meaning: 'n. 出生；诞生', phonetic: '/bɜː(r)θ/', example: '', exampleCn: '', options: ['n. 出生；诞生', 'n. v. 研究；调查', 'v. n. 挑战；考验', 'v. 重量是……'], unit: 6 },
    { word: 'adult', meaning: 'adj. 成年的 n. 成人', phonetic: '/ˈædʌlt/', example: '', exampleCn: '', options: ['adj. 成年的 n. 成人', 'adj. 令人大为惊奇的', 'v. 实现目标；成功', 'n. 旅行者；观光者'], unit: 6 },
    { word: 'bamboo', meaning: 'n. 竹子', phonetic: '/ˌbæmˈbuː/', example: '', exampleCn: '', options: ['n. 竹子', 'adj. 醒着', 'n. 疾病；病', 'n. 出生；诞生'], unit: 6 },
    { word: 'endangered', meaning: 'adj. 濒危的', phonetic: '/ɪnˈdeɪndʒə(r)d/', example: '', exampleCn: '', options: ['adj. 濒危的', 'n. 激动；兴奋', 'adj. 野生的', 'n. v. 研究；调查'], unit: 6 },
    { word: 'research', meaning: 'n. v. 研究；调查', phonetic: '/rɪˈsɜː(r)tʃ/', example: '', exampleCn: '', options: ['n. v. 研究；调查', 'adj. 濒危的', 'n. 大海；海洋', 'n. 墙'], unit: 6 },
    { word: 'keeper', meaning: 'n. 饲养员；保管人', phonetic: '/ˈkiːpə(r)/', example: '', exampleCn: '', options: ['n. 饲养员；保管人', 'v. 达到；完成；成功', 'v. 实现目标；成功', 'n. v. 旅行；旅游'], unit: 6 },
    { word: 'awake', meaning: 'adj. 醒着', phonetic: '/əˈweɪk/', example: '', exampleCn: '', options: ['adj. 醒着', 'n. 条件；状况', 'adj. 深的；纵深的', 'n. 政府；内阁'], unit: 6 },
    { word: 'excitement', meaning: 'n. 激动；兴奋', phonetic: '/ɪkˈsaɪtmənt/', example: '', exampleCn: '', options: ['n. 激动；兴奋', 'n. 竹子', 'n. 政府；内阁', 'v. 包括；包含'], unit: 6 },
    { word: 'illness', meaning: 'n. 疾病；病', phonetic: '/ˈɪlnəs/', example: '', exampleCn: '', options: ['n. 疾病；病', 'n. 自然界；大自然', 'n. 鲸', 'v. n. 挑战；考验'], unit: 6 },
    { word: 'wild', meaning: 'adj. 野生的', phonetic: '/waɪld/', example: '', exampleCn: '', options: ['adj. 野生的', 'n. 保护；保卫', 'n. 条件；状况', 'adj. 极冷的；冰冻的'], unit: 6 },
    { word: 'government', meaning: 'n. 政府；内阁', phonetic: '/ˈɡʌvə(r)nmənt/', example: '', exampleCn: '', options: ['n. 政府；内阁', 'n. 激动；兴奋', 'n. 威士忌', 'v. 达到；完成；成功'], unit: 6 },
    { word: 'whale', meaning: 'n. 鲸', phonetic: '/weɪl/', example: '', exampleCn: '', options: ['n. 鲸', 'adj. 野生的', 'n. 力；力量', 'n. 竹子'], unit: 6 },
    { word: 'oil', meaning: 'n. 油；食用油；石油', phonetic: '/ɔɪl/', example: '', exampleCn: '', options: ['n. 油；食用油；石油', 'v. 重量是……', 'adj. 令人大为惊奇的', 'adj. 厚的；浓的'], unit: 6 },
    { word: 'protection', meaning: 'n. 保护；保卫', phonetic: '/prəˈtekʃn/', example: '', exampleCn: '', options: ['n. 保护；保卫', 'adj. 成年的 n. 成人', 'n. v. 研究；调查', 'adj. 醒着'], unit: 6 },
    { word: 'huge', meaning: 'adj. 巨大的；极多的', phonetic: '/hjuːdʒ/', example: '', exampleCn: '', options: ['adj. 巨大的；极多的', 'adj. 古代的；古老的', 'v. 包括；包含', 'adj. 厚的；浓的'], unit: 6 },
    { word: 'treasure', meaning: 'n. 珠宝；财富', phonetic: '/ˈtreʒə(r)/', example: '', exampleCn: '', options: ['adj. 现代的；当代的', 'n. 珠宝；财富', 'v. 介绍；引见', 'n. 岛'], unit: 7 },
    { word: 'island', meaning: 'n. 岛', phonetic: '/ˈaɪlənd/', example: '', exampleCn: '', options: ['n. 岛', 'n. 美；美丽', 'v. 匆忙；赶快', 'v. 推荐；建议'], unit: 7 },
    { word: 'full of', meaning: '满是……的；（有）大量的；（有）丰富的', phonetic: '', example: '', exampleCn: '', options: ['满是……的；（有）大量的；（有）丰富的', 'v. 匆忙；赶快', 'v. 推荐；建议', 'v. 摧毁；毁坏'], unit: 7 },
    { word: 'classic', meaning: 'n. 经典作品；名著', phonetic: '/ˈklæsɪk/', example: '', exampleCn: '', options: ['n. 名称；标题；题目', 'n. 经典作品；名著', 'n. 小说', 'v. 属于；归属'], unit: 7 },
    { word: 'page', meaning: 'n. （书刊或纸张的）页，面，张', phonetic: '/peɪdʒ/', example: '', exampleCn: '', options: ['v. 摧毁；毁坏', 'n. 美；美丽', 'v. 介绍；引见', 'n. （书刊或纸张的）页，面，张'], unit: 7 },
    { word: 'hurry', meaning: 'v. 匆忙；赶快', phonetic: '/ˈhʌri/', example: '', exampleCn: '', options: ['v. 匆忙；赶快', 'n. 摇滚乐', 'n. 迷；狂热爱好者', 'v. 拉；拖'], unit: 7 },
    { word: 'hurry up', meaning: '赶快；急忙（做某事）', phonetic: '', example: '', exampleCn: '', options: ['n. 乐队', 'n. 经典作品；名著', '赶快；急忙（做某事）', 'n. 名称；标题；题目'], unit: 7 },
    { word: 'due', meaning: 'adj. 预期；预定', phonetic: '/djuː/', example: '', exampleCn: '', options: ['adj. 南方的', 'adj. 现代的；当代的', 'adj. 预期；预定', 'n. 迷；狂热爱好者'], unit: 7 },
    { word: 'fisherman', meaning: 'n. 渔民；钓鱼者', phonetic: '/ˈfɪʃə(r)mən/', example: '', exampleCn: '', options: ['n. 渔民；钓鱼者', 'n. 岛', 'v. 录制；录（音）', 'v. 属于；归属'], unit: 7 },
    { word: 'pull', meaning: 'v. 拉；拖', phonetic: '/pʊl/', example: '', exampleCn: '', options: ['v. 拉；拖', 'adv. 真实地；事实上', 'adj. 现代的；当代的', 'adv. 永远'], unit: 7 },
    { word: 'shark', meaning: 'n. 鲨鱼', phonetic: '/ʃɑː(r)k/', example: '', exampleCn: '', options: ['n. 鲨鱼', 'v. 匆忙；赶快', 'v. 摧毁；毁坏', 'n. 摇滚乐'], unit: 7 },
    { word: 'bone', meaning: 'n. 骨头', phonetic: '/bəʊn/', example: '', exampleCn: '', options: ['n. 岛', 'n. 摇滚乐', 'n. 骨头', 'n. 名称；标题；题目'], unit: 7 },
    { word: 'defeat', meaning: 'v. n. 击败；战胜', phonetic: '/dɪˈfiːt/', example: '', exampleCn: '', options: ['v. n. 击败；战胜', 'n. 科技；工艺', 'v. 推荐；建议', 'n. 法语'], unit: 7 },
    { word: 'destroy', meaning: 'v. 摧毁；毁坏', phonetic: '/dɪˈstrɔɪ/', example: '', exampleCn: '', options: ['v. 摧毁；毁坏', 'n. 小说', 'v. 匆忙；赶快', 'v. 录制；录（音）'], unit: 7 },
    { word: 'recommend', meaning: 'v. 推荐；建议', phonetic: '/ˌrekəˈmend/', example: '', exampleCn: '', options: ['v. 匆忙；赶快', 'v. 推荐；建议', 'v. 摧毁；毁坏', 'v. n. 击败；战胜'], unit: 7 },
    { word: 'title', meaning: 'n. 名称；标题；题目', phonetic: '/ˈtaɪtl/', example: '', exampleCn: '', options: ['n. 名称；标题；题目', 'n. 经典作品；名著', 'v. 匆忙；赶快', 'adv. 在国外；到国外'], unit: 7 },
    { word: 'fiction', meaning: 'n. 小说', phonetic: '/ˈfɪkʃn/', example: '', exampleCn: '', options: ['n. 小说', 'n. 笑；笑声', 'adj. 南方的', 'adj. 现代的；当代的'], unit: 7 },
    { word: 'science fiction', meaning: '科幻小说（或影片等）', phonetic: '', example: '', exampleCn: '', options: ['科幻小说（或影片等）', 'n. 美；美丽', 'n. 骨头', 'n. 行；排'], unit: 7 },
    { word: 'technology', meaning: 'n. 科技；工艺', phonetic: '/tekˈnɒlədʒi/', example: '', exampleCn: '', options: ['n. 科技；工艺', 'v. 匆忙；赶快', 'n. 经典作品；名著', 'n. 鲨鱼'], unit: 7 },
    { word: 'French', meaning: 'n. 法语', phonetic: '/frentʃ/', example: '', exampleCn: '', options: ['n. 法语', 'adv. 永远', 'n. 笑；笑声', 'v. 推荐；建议'], unit: 7 },
    { word: 'pop', meaning: 'n. 流行音乐；流行乐曲', phonetic: '/pɒp/', example: '', exampleCn: '', options: ['n. 流行音乐；流行乐曲', 'n. 名称；标题；题目', 'n. 岛', 'n. 骨头'], unit: 7 },
    { word: 'rock', meaning: 'n. 摇滚乐', phonetic: '/rɒk/', example: '', exampleCn: '', options: ['n. 摇滚乐', 'n. 小说', 'adv. 永远', 'n. 科技；工艺'], unit: 7 },
    { word: 'band', meaning: 'n. 乐队', phonetic: '/bænd/', example: '', exampleCn: '', options: ['n. 乐队', 'n. 经典作品；名著', 'n. 岛', 'v. 摧毁；毁坏'], unit: 7 },
    { word: 'country music', meaning: '（也作country）乡村音乐', phonetic: '', example: '', exampleCn: '', options: ['n. 骨头', '（也作country）乡村音乐', 'adv. 在国外；到国外', 'n. 行；排'], unit: 7 },
    { word: 'forever', meaning: 'adv. 永远', phonetic: '/fəˈrevə(r)/', example: '', exampleCn: '', options: ['adv. 永远', 'v. 推荐；建议', 'n. 成功', 'num. 一百万'], unit: 7 },
    { word: 'abroad', meaning: 'adv. 在国外；到国外', phonetic: '/əˈbrɔːd/', example: '', exampleCn: '', options: ['adv. 在国外；到国外', 'n. 笑；笑声', 'n. 美；美丽', 'n. 法语'], unit: 7 },
    { word: 'actually', meaning: 'adv. 真实地；事实上', phonetic: '/ˈæktʃuəli/', example: '', exampleCn: '', options: ['adv. 真实地；事实上', 'n. 迷；狂热爱好者', 'n. 骨头', 'v. 摧毁；毁坏'], unit: 7 },
    { word: 'ever since', meaning: '自从', phonetic: '', example: '', exampleCn: '', options: ['v. 匆忙；赶快', '自从', 'v. 录制；录（音）', 'n. 名称；标题；题目'], unit: 7 },
    { word: 'fan', meaning: 'n. 迷；狂热爱好者', phonetic: '/fæn/', example: '', exampleCn: '', options: ['n. 迷；狂热爱好者', 'n. 美；美丽', 'v. 推荐；建议', 'v. 介绍；引见'], unit: 7 },
    { word: 'southern', meaning: 'adj. 南方的', phonetic: '/ˈsʌðə(r)n/', example: '', exampleCn: '', options: ['adj. 南方的', 'n. 名称；标题；题目', 'adj. 现代的；当代的', 'num. 一百万'], unit: 7 },
    { word: 'modern', meaning: 'adj. 现代的；当代的', phonetic: '/ˈmɒdn/', example: '', exampleCn: '', options: ['adj. 现代的；当代的', 'n. 小说', 'v. 录制；录（音）', 'adj. 南方的'], unit: 7 },
    { word: 'success', meaning: 'n. 成功', phonetic: '/səkˈses/', example: '', exampleCn: '', options: ['n. 成功', 'v. 匆忙；赶快', 'adv. 永远', 'n. 法语'], unit: 7 },
    { word: 'belong', meaning: 'v. 属于；归属', phonetic: '/bɪˈlɒŋ/', example: '', exampleCn: '', options: ['v. 属于；归属', 'n. 科技；工艺', 'v. 摧毁；毁坏', 'n. 迷；狂热爱好者'], unit: 7 },
    { word: 'one another', meaning: '互相', phonetic: '', example: '', exampleCn: '', options: ['adv. 真实地；事实上', 'n. 岛', '互相', 'v. 匆忙；赶快'], unit: 7 },
    { word: 'laughter', meaning: 'n. 笑；笑声', phonetic: '/ˈlɑːftə/', example: '', exampleCn: '', options: ['n. 笑；笑声', 'adj. 现代的；当代的', 'adv. 在国外；到国外', 'adj. 南方的'], unit: 7 },
    { word: 'beauty', meaning: 'n. 美；美丽', phonetic: '/ˈbjuːti/', example: '', exampleCn: '', options: ['n. 美；美丽', 'n. 乐队', 'adj. 现代的；当代的', 'n. 名称；标题；题目'], unit: 7 },
    { word: 'million', meaning: 'num. 一百万', phonetic: '/ˈmɪljən/', example: '', exampleCn: '', options: ['num. 一百万', 'n. 行；排', 'n. 笑；笑声', 'n. （书刊或纸张的）页，面，张'], unit: 7 },
    { word: 'record', meaning: 'n. 唱片；记录', phonetic: '/ˈrekɔːd/', example: '', exampleCn: '', options: ['n. 唱片；记录', 'n. 骨头', 'n. 成功', 'n. 迷；狂热爱好者'], unit: 7 },
    { word: 'record', meaning: 'v. 录制；录（音）', phonetic: '/rɪˈkɔː(r)d/', example: '', exampleCn: '', options: ['n. 唱片；记录', 'n. 成功', 'n. 迷；狂热爱好者', 'v. 录制；录（音）'], unit: 7 },
    { word: 'introduce', meaning: 'v. 介绍；引见', phonetic: '/ˌɪntrəˈdjuːs/', example: '', exampleCn: '', options: ['v. 介绍；引见', 'v. 匆忙；赶快', 'v. 推荐；建议', 'n. 成功'], unit: 7 },
    { word: 'line', meaning: 'n. 行；排', phonetic: '/laɪn/', example: '', exampleCn: '', options: ['n. 行；排', 'n. 小说', 'n. 美；美丽', 'v. 摧毁；毁坏'], unit: 7 },
    { word: 'amusement', meaning: 'n. 娱乐；游戏', phonetic: '/əˈmjuːzmənt/', example: '', exampleCn: '', options: ['n. 娱乐；游戏', 'v. 发明；创造', 'v. 鼓励', 'n. 茶具'], unit: 8 },
    { word: 'amusement park', meaning: '游乐场', phonetic: '', example: '', exampleCn: '', options: ['游乐场', 'n. 发明；发明物', 'n. 娱乐；游戏', 'v. 发明；创造'], unit: 8 },
    { word: 'somewhere', meaning: 'adv. 在某处；到某处', phonetic: '/ˈsʌmweə/', example: '', exampleCn: '', options: ['adv. 在某处；到某处', 'adj. 迅速的；快速的', 'adj. 难以置信的；不真实的', 'n. 坐便器；厕所'], unit: 8 },
    { word: 'camera', meaning: 'n. 照相机；摄影机；摄像机', phonetic: '/ˈkæmərə/', example: '', exampleCn: '', options: ['n. 照相机；摄影机；摄像机', 'n. 主题', 'n. 省份', 'v. 鼓励'], unit: 8 },
    { word: 'invention', meaning: 'n. 发明；发明物', phonetic: '/ɪnˈvenʃn/', example: '', exampleCn: '', options: ['n. 发明；发明物', 'n. 娱乐；游戏', 'v. 鼓励', 'v. 发明；创造'], unit: 8 },
    { word: 'invent', meaning: 'v. 发明；创造', phonetic: '/ɪnˈvent/', example: '', exampleCn: '', options: ['v. 发明；创造', 'adj. 特别的；不寻常的', 'n. 娱乐；游戏', 'n. 进步；进展'], unit: 8 },
    { word: 'unbelievable', meaning: 'adj. 难以置信的；不真实的', phonetic: '/ˌʌnbɪˈliːvəbl/', example: '', exampleCn: '', options: ['adj. 难以置信的；不真实的', 'v. 发明；创造', 'v. 鼓励', 'n. 主题'], unit: 8 },
    { word: 'progress', meaning: 'n. 进步；进展', phonetic: '/ˈprəʊɡres/', example: '', exampleCn: '', options: ['n. 进步；进展', 'adj. 特别的；不寻常的', 'v. 收集；采集', 'adj. 迅速的；快速的'], unit: 8 },
    { word: 'rapid', meaning: 'adj. 迅速的；快速的', phonetic: '/ˈræpɪd/', example: '', exampleCn: '', options: ['adj. 迅速的；快速的', 'adj. 难以置信的；不真实的', 'adj. 完美的；完全的', 'v. 收集；采集'], unit: 8 },
    { word: 'unusual', meaning: 'adj. 特别的；不寻常的', phonetic: '/ʌnˈjuːʒuəl/', example: '', exampleCn: '', options: ['adj. 特别的；不寻常的', 'n. 发明；发明物', 'adj. 难以置信的；不真实的', 'v. 鼓励'], unit: 8 },
    { word: 'toilet', meaning: 'n. 坐便器；厕所', phonetic: '/ˈtɔɪlət/', example: '', exampleCn: '', options: ['n. 坐便器；厕所', 'n. 进步；进展', 'n. 主题', 'adj. 难以置信的；不真实的'], unit: 8 },
    { word: 'encourage', meaning: 'v. 鼓励', phonetic: '/ɪnˈkʌrɪdʒ/', example: '', exampleCn: '', options: ['v. 鼓励', 'v. 收藏', 'v. 发明；创造', 'adj. 和平的；安宁的'], unit: 8 },
    { word: 'social', meaning: 'adj. 社会的', phonetic: '/ˈsəʊʃl/', example: '', exampleCn: '', options: ['adj. 社会的', 'adj. 完美的；完全的', 'adj. 安全的；无危险的', 'n. 主题'], unit: 8 },
    { word: 'peaceful', meaning: 'adj. 和平的；安宁的', phonetic: '/ˈpiːsfl/', example: '', exampleCn: '', options: ['adj. 和平的；安宁的', 'adj. 难以置信的；不真实的', 'v. 收集；采集', 'adj. 迅速；快速'], unit: 8 },
    { word: 'tea art', meaning: '茶艺', phonetic: '', example: '', exampleCn: '', options: ['茶艺', 'n. 进步；进展', 'adj. 难以置信的；不真实的', 'v. 发明；创造'], unit: 8 },
    { word: 'performance', meaning: 'n. 表演；演出', phonetic: '/pə(r)ˈfɔː(r)məns/', example: '', exampleCn: '', options: ['n. 表演；演出', 'adj. 和平的；安宁的', 'adj. 特殊的', 'v. 鼓励'], unit: 8 },
    { word: 'perfect', meaning: 'adj. 完美的；完全的', phonetic: '/ˈpɜː(r)fɪkt/', example: '', exampleCn: '', options: ['adj. 完美的；完全的', 'v. 鼓励', 'n. 茶艺', 'n. 茶具'], unit: 8 },
    { word: 'tea set', meaning: '茶具', phonetic: '', example: '', exampleCn: '', options: ['茶具', 'v. 鼓励', 'adj. 难以置信的；不真实的', 'adj. 迅速的；快速的'], unit: 8 },
    { word: 'itself', meaning: 'pron.（it的反身代词）它自己', phonetic: '/ɪtˈself/', example: '', exampleCn: '', options: ['pron.（it的反身代词）它自己', 'adj. 完美的；完全的', 'n. 省份', 'n. 主题'], unit: 8 },
    { word: 'collect', meaning: 'v. 收集；采集', phonetic: '/kəˈlekt/', example: '', exampleCn: '', options: ['v. 收集；采集', 'adj. 迅速的；快速的', 'adj. 特别的；不寻常的', 'n. 茶具'], unit: 8 },
    { word: 'a couple of', meaning: '两个；一对；几个', phonetic: '', example: '', exampleCn: '', options: ['两个；一对；几个', 'adj. 迅速的；快速的', 'adj. 难以置信的；不真实的', 'v. 收藏'], unit: 8 },
    { word: 'German', meaning: 'adj. 德国的；德语的；德国人的 n. 德语；德国人', phonetic: '/ˈdʒɜː(r)mən/', example: '', exampleCn: '', options: ['adj. 德国的；德语的；德国人的 n. 德语；德国人', 'adv. 仅仅；只；不过', 'adj. 和平的；安宁的', 'n. 娱乐；游戏'], unit: 8 },
    { word: 'theme', meaning: 'n. 主题', phonetic: '/θiːm/', example: '', exampleCn: '', options: ['n. 主题', 'adj. 迅速的；快速的', 'n. 茶具', 'n. 省份'], unit: 8 },
    { word: 'ride', meaning: 'n. 供乘骑的游乐设施；短途旅程', phonetic: '/raɪd/', example: '', exampleCn: '', options: ['n. 供乘骑的游乐设施；短途旅程', 'n. 娱乐；游戏', 'n. 茶艺', 'adj. 特别的；不寻常的'], unit: 8 },
    { word: 'province', meaning: 'n. 省份', phonetic: '/ˈprɒvɪns/', example: '', exampleCn: '', options: ['n. 省份', 'adj. 完美的；完全的', 'n. 主题', 'adj. 社会的'], unit: 8 },
    { word: 'thousand', meaning: 'num. 一千', phonetic: '/ˈθaʊznd/', example: '', exampleCn: '', options: ['num. 一千', 'n. 省份', 'adj. 和平的；安宁的', 'v. 收集；采集'], unit: 8 },
    { word: 'thousands of', meaning: '数以千计的；许许多多的', phonetic: '', example: '', exampleCn: '', options: ['数以千计的；许许多多的', 'v. 鼓励', 'adj. 完美的；完全的', 'n. 茶艺'], unit: 8 },
    { word: 'on the one hand … on the other hand …', meaning: '一方面……另一方面……', phonetic: '', example: '', exampleCn: '', options: ['一方面……另一方面……', 'adj. 安全的；无危险的', 'n. 主题', 'n. 省份'], unit: 8 },
    { word: 'safe', meaning: 'adj. 安全的；无危险的', phonetic: '/seɪf/', example: '', exampleCn: '', options: ['adj. 安全的；无危险的', 'v. 收集；采集', 'n. 表演；演出', 'v. 鼓励'], unit: 8 },
    { word: 'population', meaning: 'n. 人口；人口数量', phonetic: '/ˌpɒpjuˈleɪʃn/', example: '', exampleCn: '', options: ['n. 人口；人口数量', 'n. 主题', 'n. 坐便器；厕所', 'adj. 完美的；完全的'], unit: 8 },
    { word: 'simply', meaning: 'adv. 仅仅；只；不过', phonetic: '/ˈsɪmpli/', example: '', exampleCn: '', options: ['adv. 仅仅；只；不过', 'adj. 和平的；安宁的', 'n. 省份', 'adj. 社会的'], unit: 8 },
    { word: 'fear', meaning: 'v. n. 害怕；惧怕', phonetic: '/fɪə/', example: '', exampleCn: '', options: ['v. n. 害怕；惧怕', 'n. 主题', 'n. 人口；人口数量', 'adj. 难以置信的；不真实的'], unit: 8 },
    { word: 'whether', meaning: 'conj. 不管……（还是）；或者……（或者）；是否', phonetic: '/ˈweðə(r)/', example: '', exampleCn: '', options: ['conj. 不管……（还是）；或者……（或者）；是否', 'n. 茶具', 'adj. 社会的', 'adj. 和平的；安宁的'], unit: 8 },
    { word: 'Indian', meaning: 'adj. 印度的 n. 印度人', phonetic: '/ˈɪndiən/', example: '', exampleCn: '', options: ['adj. 印度的 n. 印度人', 'adj. 安全的；无危险的', 'adj. 难以置信的；不真实的', 'adj. 迅速的；快速的'], unit: 8 },
    { word: 'Japanese', meaning: 'adj. 日本的；日本人的；日语的 n. 日本人；日语', phonetic: '/ˌdʒæpəˈniːz/', example: '', exampleCn: '', options: ['adj. 日本的；日本人的；日语的 n. 日本人；日语', 'adj. 德国的；德语的；德国人的 n. 德语；德国人', 'adv. 仅仅；只；不过', 'n. 动物'], unit: 8 },
    { word: 'fox', meaning: 'n. 狐狸', phonetic: '/fɒks/', example: '', exampleCn: '', options: ['n. 狐狸', 'adj. 难以置信的；不真实的', 'n. 省份', 'adj. 和平的；安宁的'], unit: 8 },
    { word: 'all year round', meaning: '全年', phonetic: '', example: '', exampleCn: '', options: ['全年', 'adj. 和平的；安宁的', 'v. 收集；采集', 'adj. 难以置信的；不真实的'], unit: 8 },
    { word: 'equator', meaning: 'n. 赤道', phonetic: '/ɪˈkweɪtə(r)/', example: '', exampleCn: '', options: ['n. 赤道', 'v. 收集；采集', 'adj. 难以置信的；不真实的', 'adj. 快速的'], unit: 8 },
    { word: 'whenever', meaning: 'conj. 在任何……的时候；无论何时', phonetic: '/wenˈevə(r)/', example: '', exampleCn: '', options: ['conj. 在任何……的时候；无论何时', 'adj. 迅速的；快速的', 'adj. 社会的', 'n. 茶艺'], unit: 8 },
    { word: 'spring', meaning: 'n. 春天', phonetic: '/sprɪŋ/', example: '', exampleCn: '', options: ['n. 春天', 'v. 发明；创造', 'v. n. 害怕；惧怕', 'adj. 难以置信的；不真实的'], unit: 8 },
    { word: 'mostly', meaning: 'adv. 主要地；通常', phonetic: '/ˈməʊstli/', example: '', exampleCn: '', options: ['adv. 主要地；通常', 'adj. 难以置信的；不真实的', 'n. 人口；人口数量', 'adj. 安全的；无危险的'], unit: 8 },
    { word: 'location', meaning: 'n. 地点；位置', phonetic: '/ləʊˈkeɪʃn/', example: '', exampleCn: '', options: ['n. 地点；位置', 'n. 主题', 'adj. 社会的', 'adj. 迅速的；快速的'], unit: 8 },
    { word: 'yard', meaning: 'n. 院子', phonetic: '/jɑː(r)d/', example: '', exampleCn: '', options: ['n. 院子', 'adj. 诚实的；老实的', 'n. 卧室', 'n. 玩具'], unit: 9 },
    { word: 'yard sale', meaning: '庭院拍卖会', phonetic: '', example: '', exampleCn: '', options: ['庭院拍卖会', 'n. 生产者；制订者', 'v. 数数', 'n. 玩具'], unit: 9 },
    { word: 'sweet', meaning: 'adj. 甜蜜的；甜的；含糖的', phonetic: '/swiːt/', example: '', exampleCn: '', options: ['adj. 甜蜜的；甜的；含糖的', 'n. 板；木板', 'adj. 诚实的；老实的', 'n. 分；分币'], unit: 9 },
    { word: 'memory', meaning: 'n. 记忆；回忆', phonetic: '/ˈmeməri/', example: '', exampleCn: '', options: ['n. 记忆；回忆', 'n. 玩具', 'v. 将……认为；把……视为；看待', 'n. 院子'], unit: 9 },
    { word: 'cent', meaning: 'n. 分；分币', phonetic: '/sent/', example: '', exampleCn: '', options: ['n. 分；分币', 'n. 玩具', 'n. 板；木板', 'n. 家乡；故乡'], unit: 9 },
    { word: 'toy', meaning: 'n. 玩具', phonetic: '/tɔɪ/', example: '', exampleCn: '', options: ['n. 玩具', 'n. 生产者；制订者', 'v. n. 检查；审查', 'n. 围巾；披巾；头巾'], unit: 9 },
    { word: 'bear', meaning: 'n. 熊', phonetic: '/beə/', example: '', exampleCn: '', options: ['n. 熊', 'adj. 软的；柔软的', 'n. 院子', 'v. 清理；清除'], unit: 9 },
    { word: 'maker', meaning: 'n. 生产者；制订者', phonetic: '/ˈmeɪkə(r)/', example: '', exampleCn: '', options: ['n. 生产者；制订者', 'n. 板；木板', 'adj. 诚实的；老实的', 'n. 分；分币'], unit: 9 },
    { word: 'bread maker', meaning: '面包机', phonetic: '', example: '', exampleCn: '', options: ['面包机', 'v. 清理；清除', 'n. 生产者；制订者', 'adj. 软的；柔软的'], unit: 9 },
    { word: 'scarf', meaning: 'n. 围巾；披巾；头巾', phonetic: '/skɑː(r)f/', example: '', exampleCn: '', options: ['n. 围巾；披巾；头巾', 'v. 拥有；有', 'n. 铁路；铁道', 'v. 离开；分开'], unit: 9 },
    { word: 'soft', meaning: 'adj. 软的；柔软的', phonetic: '/sɒft/', example: '', exampleCn: '', options: ['adj. 软的；柔软的', 'n. 生产者；制订者', 'n. 院子', 'n. 分；分币'], unit: 9 },
    { word: 'soft toy', meaning: '软体玩具；布绒玩具', phonetic: '', example: '', exampleCn: '', options: ['软体玩具；布绒玩具', 'n. 板；木板', 'n. 围巾；披巾；头巾', 'n. 玩具'], unit: 9 },
    { word: 'check', meaning: 'v. n. 检查；审查', phonetic: '/tʃek/', example: '', exampleCn: '', options: ['v. n. 检查；审查', 'v. 数数', 'n. 熊', 'n. 生产者；制订者'], unit: 9 },
    { word: 'check out', meaning: '察看；观察', phonetic: '', example: '', exampleCn: '', options: ['察看；观察', 'n. 铁路；铁道', 'v. 数数', 'n. 熊'], unit: 9 },
    { word: 'board', meaning: 'n. 板；木板', phonetic: '/bɔː(r)d/', example: '', exampleCn: '', options: ['n. 板；木板', 'v. 离开；分开', 'n. 生产者；制订者', 'adj. 诚实的；老实的'], unit: 9 },
    { word: 'board game', meaning: '棋类游戏', phonetic: '', example: '', exampleCn: '', options: ['棋类游戏', 'n. 板；木板', 'n. 围巾；披巾；头巾', 'v. n. 检查；审查'], unit: 9 },
    { word: 'junior', meaning: 'adj. 地位（或职位、级别）低下的', phonetic: '/ˈdʒuːniə(r)/', example: '', exampleCn: '', options: ['adj. 地位（或职位、级别）低下的', 'n. 院子', 'n. 玩具', 'v. n. 检查；审查'], unit: 9 },
    { word: 'junior high school', meaning: '初级中学', phonetic: '', example: '', exampleCn: '', options: ['初级中学', 'n. 围巾；披巾；头巾', 'v. 清理；清除', 'v. n. 检查；审查'], unit: 9 },
    { word: 'clear', meaning: 'v. 清理；清除', phonetic: '/klɪə/', example: '', exampleCn: '', options: ['v. 清理；清除', 'adj. 软的；柔软的', 'n. 熊', 'n. 生产者；制订者'], unit: 9 },
    { word: 'clear out', meaning: '清理；丢掉', phonetic: '', example: '', exampleCn: '', options: ['清理；丢掉', 'v. 拥有；有', 'adj. 地位（或职位、级别）低下的', 'adj. 软的；柔软的'], unit: 9 },
    { word: 'bedroom', meaning: 'n. 卧室', phonetic: '/ˈbedruːm/', example: '', exampleCn: '', options: ['n. 卧室', 'n. 生产者；制订者', 'adj. 地位（或职位、级别）低下的', 'v. n. 检查；审查'], unit: 9 },
    { word: 'no longer', meaning: '不再；不复', phonetic: '', example: '', exampleCn: '', options: ['不再；不复', 'n. 板；木板', 'v. 离开；分开', 'n. 玩具'], unit: 9 },
    { word: 'own', meaning: 'v. 拥有；有', phonetic: '/əʊn/', example: '', exampleCn: '', options: ['v. 拥有；有', 'n. 铁路；铁道', 'v. 清理；清除', 'adj. 软的；柔软的'], unit: 9 },
    { word: 'railway', meaning: 'n. 铁路；铁道', phonetic: '/ˈreɪlweɪ/', example: '', exampleCn: '', options: ['n. 铁路；铁道', 'n. 记忆；回忆', 'n. 分；分币', 'v. 清理；清除'], unit: 9 },
    { word: 'part', meaning: 'v. 离开；分开', phonetic: '/pɑː(r)t/', example: '', exampleCn: '', options: ['v. 离开；分开', 'v. 拥有；有', 'n. 记忆；回忆', 'n. 玩具'], unit: 9 },
    { word: 'part with', meaning: '放弃、交出（尤指不舍得的东西）', phonetic: '', example: '', exampleCn: '', options: ['放弃、交出（尤指不舍得的东西）', 'adj. 软；柔软', 'n. 铁路；铁道', 'n. 生产者；制订者'], unit: 9 },
    { word: 'certain', meaning: 'adj. 某种；某事；某人', phonetic: '/ˈsɜː(r)tn/', example: '', exampleCn: '', options: ['adj. 某种；某事；某人', 'adj. 诚实的；老实的', 'v. 数数', 'n. 生产者；制订者'], unit: 9 },
    { word: 'as for', meaning: '至于；关于', phonetic: '', example: '', exampleCn: '', options: ['至于；关于', 'adj. 诚实的；真实的', 'v. 将……认为；把……视为；看待', 'n. 围巾；披巾；头巾'], unit: 9 },
    { word: 'honest', meaning: 'adj. 诚实的；老实的', phonetic: '/ˈɒnɪst/', example: '', exampleCn: '', options: ['adj. 诚实的；老实的', 'n. 家乡；故乡', 'n. 彩色铅笔（或粉笔、蜡笔）', 'adj. 某种；某事；某人'], unit: 9 },
    { word: 'to be honest', meaning: '说实在的', phonetic: '', example: '', exampleCn: '', options: ['说实在的', 'n. 围巾；披巾；头巾', 'n. 家乡；故乡', 'adv. 尤其；特别；格外'], unit: 9 },
    { word: 'while', meaning: 'n. 一段时间；一会儿', phonetic: '/waɪl/', example: '', exampleCn: '', options: ['n. 一段时间；一会儿', 'n. 记忆；回忆', 'v. 将……认为；把……视为；看待', 'n. 家乡；故乡'], unit: 9 },
    { word: 'truthful', meaning: 'adj. 诚实的；真实的', phonetic: '/ˈtruːθfl/', example: '', exampleCn: '', options: ['adj. 诚实的；真实的', 'adj. 某种；某事；某人', 'v. 数数', 'n. 生产者；制订者'], unit: 9 },
    { word: 'gun', meaning: 'n. 枪；炮', phonetic: '/ɡʌn/', example: '', exampleCn: '', options: ['n. 枪；炮', 'v. 将……认为；把……视为；看待', 'v. 清理；清除', 'n. 生产者；制订者'], unit: 9 },
    { word: 'sand', meaning: 'n. 沙滩；沙', phonetic: '/sænd/', example: '', exampleCn: '', options: ['n. 沙滩；沙', 'n. 生产者；制订者', 'n. 分；分币', 'n. 板；木板'], unit: 9 },
    { word: 'hometown', meaning: 'n. 家乡；故乡', phonetic: '/ˈhəʊmtaʊn/', example: '', exampleCn: '', options: ['n. 家乡；故乡', 'v. 数数', 'v. 将……认为；把……视为；看待', 'v. 清理；清除'], unit: 9 },
    { word: 'search', meaning: 'v. n. 搜索；搜查', phonetic: '/sɜː(r)tʃ/', example: '', exampleCn: '', options: ['v. n. 搜索；搜查', 'n. 玩具', 'adj. 地位（或职位、级别）低下的', 'n. 铁路；铁道'], unit: 9 },
    { word: 'among', meaning: 'prep. 在（其）中；……之一', phonetic: '/əˈmʌŋ/', example: '', exampleCn: '', options: ['prep. 在（其）中；……之一', 'adj. 甜蜜的；甜的；含糖的', 'v. 拥有；有', 'adv. 现今；现在；目前'], unit: 9 },
    { word: 'crayon', meaning: 'n. 彩色铅笔（或粉笔、蜡笔）', phonetic: '/ˈkreɪən/', example: '', exampleCn: '', options: ['n. 彩色铅笔（或粉笔、蜡笔）', 'n. 羞耻；羞愧；惭愧', 'prep. 在（其）中；……之一', 'n. 铁路；铁道'], unit: 9 },
    { word: 'shame', meaning: 'n. 羞耻；羞愧；惭愧', phonetic: '/ʃeɪm/', example: '', exampleCn: '', options: ['n. 羞耻；羞愧；惭愧', 'v. 数数', 'n. 板；木板', 'n. 家乡；故乡'], unit: 9 },
    { word: 'nowadays', meaning: 'adv. 现今；现在；目前', phonetic: '/ˈnaʊədeɪz/', example: '', exampleCn: '', options: ['adv. 现今；现在；目前', 'adj. 诚实的；真实的', 'v. 注视；仔细考虑', 'v. 离开；分开'], unit: 9 },
    { word: 'century', meaning: 'n. 百年；世纪', phonetic: '/ˈsentʃəri/', example: '', exampleCn: '', options: ['n. 百年；世纪', 'n. 童年；幼年', 'v. n. 搜索；搜查', 'n. 记忆；回忆'], unit: 9 },
    { word: 'count', meaning: 'v. 数数', phonetic: '/kaʊnt/', example: '', exampleCn: '', options: ['v. 数数', 'n. 玩具', 'v. n. 检查；审查', 'n. 一段时间；一会儿'], unit: 9 },
    { word: 'regard', meaning: 'v. 将……认为；把……视为；看待', phonetic: '/rɪˈɡɑː(r)d/', example: '', exampleCn: '', options: ['v. 将……认为；把……视为；看待', 'adj. 诚实的；真实的', 'n. 羞耻；羞愧；惭愧', 'adv. 尤其；特别；格外'], unit: 9 },
    { word: 'according to', meaning: '依据；按照', phonetic: '', example: '', exampleCn: '', options: ['依据；按照', 'adv. 现今；现在；目前', 'v. n. 搜索；搜查', 'v. 拥有；抓住'], unit: 9 },
    { word: 'opposite', meaning: 'prep. 与……相对；在……对面 adj. 对面的；另一边的', phonetic: '/ˈɒpəzɪt/', example: '', exampleCn: '', options: ['prep. 与……相对；在……对面 adj. 对面的；另一边的', 'n. 玩具', 'v. 数数', 'n. 床'], unit: 9 },
    { word: 'especially', meaning: 'adv. 尤其；特别；格外', phonetic: '/ɪˈspeʃəli/', example: '', exampleCn: '', options: ['adv. 尤其；特别；格外', 'n. 童年；幼年', 'adj. 诚实的；真实的', 'adj. 某种；某事；某人'], unit: 9 },
    { word: 'childhood', meaning: 'n. 童年；幼年', phonetic: '/ˈtʃaɪldhʊd/', example: '', exampleCn: '', options: ['n. 童年；幼年', 'adv. 现今；现在；目前', 'prep. 与……相对；在……对面 adj. 对面的；另一边的', 'v. 注视；仔细考虑'], unit: 9 },
    { word: 'consider', meaning: 'v. 注视；仔细考虑', phonetic: '/kənˈsɪdə(r)/', example: '', exampleCn: '', options: ['v. 注视；仔细考虑', 'n. 百年；世纪', 'n. 沙滩；沙', 'n. 家乡；故乡'], unit: 9 },
    { word: 'close to', meaning: '几乎；接近', phonetic: '', example: '', exampleCn: '', options: ['几乎；接近', 'v. 注视；仔细考虑', 'n. 童年；幼年', 'n. 枪；炮'], unit: 9 },
    { word: 'hold', meaning: 'v. 拥有；抓住', phonetic: '/həʊld/', example: '', exampleCn: '', options: ['v. 拥有；抓住', 'n. 百年；世纪', 'v. 数数', 'n. 羞耻；羞愧；惭愧'], unit: 9 },
  ],
};

const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM';

export default function WordCardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [grade, setGrade] = useState<Grade>(7);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [showPhonetic, setShowPhonetic] = useState(false);

  const words = WORD_DATA[grade];
  const word = words[index % words.length];

  const shuffleOptions = useCallback((w: Word) => {
    const opts = [...w.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, []);

  const [shuffled, setShuffled] = useState<string[]>(() => shuffleOptions(words[0]));

  useEffect(() => {
    setShuffled(shuffleOptions(words[index % words.length]));
  }, [index, grade]);

  const loadProgress = (g: Grade) => {
    const saved = localStorage.getItem(`vocab_progress_${g}`);
    if (saved) {
      try {
        const p: VocabProgress = JSON.parse(saved);
        setGrade(g); setIndex(p.index); setCorrect(p.correct); setTotal(p.total);
        setLearned(new Set(p.learned));
        if (p.wrongWords?.length) setWrongWords(p.wrongWords.map(w => ({ ...w, phonetic: '', example: '', exampleCn: '', options: [] })));
        return true;
      } catch {}
    }
    return false;
  };

  // Load progress on mount
  useEffect(() => {
    if (!loadProgress(grade)) {
      setIndex(0); setCorrect(0); setTotal(0); setLearned(new Set()); setWrongWords([]);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${SUPABASE_URL}token_transactions?user_id=eq.${user.id}&type=eq.vocab_progress&order=created_at.desc&limit=3`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    }).then(r => r.json()).then(data => {
      if (!Array.isArray(data)) return;
      data.forEach((tx: any) => {
        if (!tx.description) return;
        try {
          const p: VocabProgress = JSON.parse(tx.description);
          localStorage.setItem(`vocab_progress_${p.grade}`, JSON.stringify(p));
        } catch {}
      });
      toast.success('已恢复学习进度');
    }).catch(() => {});
  }, [user?.id]);

  // Save progress to localStorage on every change (per-grade keys)
  useEffect(() => {
    const p: VocabProgress = {
      grade, index, correct, total,
      learned: Array.from(learned),
      wrongWords: wrongWords.map(w => ({ word: w.word, meaning: w.meaning })),
    };
    localStorage.setItem(`vocab_progress_${grade}`, JSON.stringify(p));
  }, [grade, index, correct, total, learned, wrongWords]);

  // Debounced sync to Supabase for registered users
  useEffect(() => {
    if (!user?.id) return;
    const timer = setTimeout(() => {
      const p: VocabProgress = {
        grade, index, correct, total,
        learned: Array.from(learned),
        wrongWords: wrongWords.map(w => ({ word: w.word, meaning: w.meaning })),
      };
      fetch(`${SUPABASE_URL}token_transactions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: user.id, type: 'vocab_progress', amount: 0,
          description: JSON.stringify(p),
        }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [user, grade, index, correct, total, learned, wrongWords]);

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    setTotal(t => t + 1);
    if (opt === word.meaning) {
      setCorrect(c => c + 1);
      setLearned(prev => new Set(prev).add(word.word));
    } else {
      setWrongWords(prev => [...prev, word]);
    }
  };

  const next = () => {
    if (index >= words.length - 1) {
      toast.success(`🎉 ${GRADE_LABELS[grade]}全部完成！`);
      setGrade(g => (g >= 10 ? 7 : (g + 1) as Grade));
      setIndex(0);
    } else {
      setIndex(i => i + 1);
    }
    setSelected(null);
    setAnswered(false);
  };

  const reset = () => {
    if (!confirm('确定重新开始？当前进度将丢失。')) return;
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrect(0);
    setTotal(0);
    setLearned(new Set());
    setWrongWords([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">背单词</h1>
          {user && (
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-auto flex items-center gap-1">
              <Cloud className="w-3 h-3" />已同步
            </span>
          )}
        </div>

        {/* Grade Selector */}
        <div className="flex gap-2 mb-4">
          {([7, 8, 9, 10] as Grade[]).map(g => (
            <button key={g} onClick={() => { setGrade(g); setSelected(null); setAnswered(false); if (!loadProgress(g)) { setIndex(0); setCorrect(0); setTotal(0); setLearned(new Set()); setWrongWords([]); } }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${grade === g ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              {GRADE_LABELS[g]}
            </button>
          ))}
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="flex items-center justify-between mb-4 px-3 py-2 bg-white rounded-xl border border-slate-100">
            <span className="text-sm text-slate-500">正确率 {total > 0 ? Math.round(correct / total * 100) : 0}%</span>
            <span className="text-sm text-slate-500">已学 {learned.size}/{words.length}</span>
            <span className="text-sm text-emerald-600 font-medium">{correct}/{total}</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 mb-4 min-h-[320px] flex flex-col items-center justify-center">
          <p className="text-sm text-slate-400 mb-1">{index + 1}/{words.length}</p>
          {word.unit !== undefined && (
            <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full mb-2">{GRADE_UNIT_LABELS[grade]?.[word.unit ?? -1] ?? ''}</span>
          )}
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{word.word}</h2>
          
          <button onClick={() => setShowPhonetic(!showPhonetic)}
            className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 mb-6">
            <Volume2 className="w-4 h-4" />
            {showPhonetic ? word.phonetic : '点击显示音标'}
          </button>

          <p className="text-sm text-slate-500 italic mb-6 text-center">{word.example}</p>
          <p className="text-xs text-slate-400 mb-6">{word.exampleCn}</p>

          {/* Options */}
          <div className="w-full space-y-2">
            {shuffled.map((opt, i) => {
              let bg = 'bg-slate-50 hover:bg-slate-100 border-slate-200';
              let text = 'text-slate-700';
              if (answered) {
                if (opt === word.meaning) { bg = 'bg-emerald-50 border-emerald-400'; text = 'text-emerald-700'; }
                else if (opt === selected) { bg = 'bg-red-50 border-red-400'; text = 'text-red-700'; }
              } else if (opt === selected) {
                bg = 'bg-indigo-50 border-indigo-400'; text = 'text-indigo-700';
              }
              return (
                <button key={i} onClick={() => handleSelect(opt)} disabled={answered}
                  className={`w-full py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${bg} ${text} ${answered ? 'cursor-default' : 'cursor-pointer'}`}>
                  <span className="inline-block w-6 text-slate-400 font-mono">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                  {answered && opt === word.meaning && <Check className="inline w-4 h-4 ml-2 text-emerald-500" />}
                  {answered && opt === selected && opt !== word.meaning && <X className="inline w-4 h-4 ml-2 text-red-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        {answered && (
          <button onClick={next}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200">
            {index >= words.length - 1 ? '完成本年级 ✓' : '下一题 →'}
          </button>
        )}

        {/* Wrong Words Review */}
        {wrongWords.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2"><X className="w-4 h-4 text-red-400" />错词本 ({wrongWords.length})</h3>
              <button onClick={() => setWrongWords([])} className="text-xs text-slate-400 hover:text-slate-600">清空</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {wrongWords.slice(0, 10).map((w, i) => (
                <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">{w.word}</span>
              ))}
            </div>
          </div>
        )}

        {/* Reset */}
        <button onClick={reset} className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" />重新开始
        </button>
      </div>
    </div>
  );
}
