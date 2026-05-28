import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, Check, X, RefreshCw, Cloud } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

type Grade = 7 | 8 | 9;

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

const GRADE_LABELS: Record<Grade, string> = { 7: '七年级', 8: '八年级', 9: '九年级' };

const UNIT_LABELS: Record<number, string> = {
  0: 'Starter U1', 1: 'Starter U2', 2: 'Starter U3',
  3: 'Unit 1', 4: 'Unit 2', 5: 'Unit 3', 6: 'Unit 4', 7: 'Unit 5', 8: 'Unit 6', 9: 'Unit 7',
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
    { word: 'volunteer', meaning: '志愿者', phonetic: '/ˌvɒlənˈtɪə(r)/', example: 'I want to be a volunteer.', exampleCn: '我想成为一名志愿者。', options: ['老师', '志愿者', '医生', '司机'] },
    { word: 'education', meaning: '教育', phonetic: '/ˌedʒuˈkeɪʃn/', example: 'Education is important.', exampleCn: '教育非常重要。', options: ['工作', '教育', '健康', '环境'] },
    { word: 'environment', meaning: '环境', phonetic: '/ɪnˈvaɪrənmənt/', example: 'We should protect the environment.', exampleCn: '我们应该保护环境。', options: ['环境', '建筑', '交通', '科技'] },
    { word: 'exercise', meaning: '锻炼', phonetic: '/ˈeksəsaɪz/', example: 'We should exercise every day.', exampleCn: '我们应该每天锻炼。', options: ['学习', '工作', '锻炼', '休息'] },
    { word: 'healthy', meaning: '健康的', phonetic: '/ˈhelθi/', example: 'Eating fruit is healthy.', exampleCn: '吃水果是健康的。', options: ['美味的', '健康的', '有趣的', '重要的'] },
    { word: 'vacation', meaning: '假期', phonetic: '/vəˈkeɪʃn/', example: 'Summer vacation is coming.', exampleCn: '暑假快到了。', options: ['周末', '假期', '节日', '季节'] },
    { word: 'program', meaning: '节目；项目', phonetic: '/ˈprəʊɡræm/', example: 'I like this TV program.', exampleCn: '我喜欢这个电视节目。', options: ['节目', '电影', '音乐', '游戏'] },
    { word: 'technology', meaning: '技术', phonetic: '/tekˈnɒlədʒi/', example: 'Technology changes our lives.', exampleCn: '技术改变了我们的生活。', options: ['科学', '技术', '数学', '历史'] },
    { word: 'information', meaning: '信息', phonetic: '/ˌɪnfəˈmeɪʃn/', example: 'Find information online.', exampleCn: '在网上查找信息。', options: ['信息', '知识', '新闻', '数据'] },
    { word: 'experience', meaning: '经历；经验', phonetic: '/ɪkˈspɪriəns/', example: 'It\'s a wonderful experience.', exampleCn: '这是一次美妙的经历。', options: ['经历', '旅行', '课程', '活动'] },
    { word: 'success', meaning: '成功', phonetic: '/səkˈses/', example: 'Hard work brings success.', exampleCn: '努力工作带来成功。', options: ['成功', '失败', '进步', '结果'] },
    { word: 'challenge', meaning: '挑战', phonetic: '/ˈtʃælɪndʒ/', example: 'Face the challenge bravely.', exampleCn: '勇敢面对挑战。', options: ['挑战', '机会', '改变', '选择'] },
    { word: 'communicate', meaning: '交流', phonetic: '/kəˈmjuːnɪkeɪt/', example: 'We communicate in English.', exampleCn: '我们用英语交流。', options: ['交流', '讨论', '分享', '解释'] },
    { word: 'discover', meaning: '发现', phonetic: '/dɪˈskʌvə(r)/', example: 'I discovered a new way.', exampleCn: '我发现了一个新方法。', options: ['发明', '发现', '探索', '研究'] },
    { word: 'improve', meaning: '提高', phonetic: '/ɪmˈpruːv/', example: 'I want to improve my English.', exampleCn: '我想提高英语。', options: ['提高', '改变', '保持', '开始'] },
    { word: 'culture', meaning: '文化', phonetic: '/ˈkʌltʃə(r)/', example: 'Chinese culture is great.', exampleCn: '中国文化很伟大。', options: ['文化', '历史', '艺术', '传统'] },
    { word: 'festival', meaning: '节日', phonetic: '/ˈfestɪvl/', example: 'Spring Festival is in January.', exampleCn: '春节在一月。', options: ['节日', '周末', '假期', '季节'] },
    { word: 'traditional', meaning: '传统的', phonetic: '/trəˈdɪʃənl/', example: 'We eat traditional food.', exampleCn: '我们吃传统食物。', options: ['传统的', '现代的', '流行的', '重要的'] },
    { word: 'preparation', meaning: '准备', phonetic: '/ˌprepəˈreɪʃn/', example: 'We made good preparations.', exampleCn: '我们做了充分准备。', options: ['准备', '计划', '决定', '开始'] },
    { word: 'achievement', meaning: '成就', phonetic: '/əˈtʃiːvmənt/', example: 'It\'s a great achievement.', exampleCn: '这是一项伟大的成就。', options: ['成就', '进步', '目标', '梦想'] },
    { word: 'society', meaning: '社会', phonetic: '/səˈsaɪəti/', example: 'We help people in society.', exampleCn: '我们帮助社会上的人。', options: ['社会', '社区', '国家', '世界'] },
    { word: 'opportunity', meaning: '机会', phonetic: '/ˌɒpəˈtjuːnəti/', example: 'Don\'t miss the opportunity.', exampleCn: '不要错过机会。', options: ['机会', '挑战', '选择', '改变'] },
    { word: 'pollution', meaning: '污染', phonetic: '/pəˈluːʃn/', example: 'Air pollution is serious.', exampleCn: '空气污染很严重。', options: ['污染', '保护', '回收', '浪费'] },
    { word: 'recycle', meaning: '回收利用', phonetic: '/ˌriːˈsaɪkl/', example: 'We should recycle paper.', exampleCn: '我们应该回收纸。', options: ['回收利用', '减少', '重复使用', '丢弃'] },
    { word: 'mountain', meaning: '山', phonetic: '/ˈmaʊntən/', example: 'We climbed the mountain.', exampleCn: '我们爬了山。', options: ['河流', '山', '森林', '海洋'] },
    { word: 'forest', meaning: '森林', phonetic: '/ˈfɒrɪst/', example: 'The forest is beautiful.', exampleCn: '森林很美。', options: ['森林', '沙漠', '草原', '海洋'] },
    { word: 'modern', meaning: '现代的', phonetic: '/ˈmɒdn/', example: 'This is a modern city.', exampleCn: '这是一个现代城市。', options: ['现代的', '传统的', '古代的', '未来的'] },
    { word: 'perfect', meaning: '完美的', phonetic: '/ˈpɜːfɪkt/', example: 'The weather is perfect.', exampleCn: '天气完美。', options: ['完美的', '极好的', '糟糕的', '普通的'] },
    { word: 'situation', meaning: '情况；形势', phonetic: '/ˌsɪtʃuˈeɪʃn/', example: 'The situation is improving.', exampleCn: '情况正在好转。', options: ['情况', '位置', '方向', '条件'] },
    { word: 'decision', meaning: '决定', phonetic: '/dɪˈsɪʒn/', example: 'It\'s your decision.', exampleCn: '这是你的决定。', options: ['决定', '选择', '计划', '建议'] },
    { word: 'purpose', meaning: '目的', phonetic: '/ˈpɜːpəs/', example: 'What is your purpose?', exampleCn: '你的目的是什么？', options: ['目的', '原因', '结果', '方式'] },
    { word: 'benefit', meaning: '好处；益处', phonetic: '/ˈbenɪfɪt/', example: 'Exercise has many benefits.', exampleCn: '锻炼有很多好处。', options: ['好处', '坏处', '影响', '效果'] },
    { word: 'research', meaning: '研究', phonetic: '/rɪˈsɜːtʃ/', example: 'We do scientific research.', exampleCn: '我们做科学研究。', options: ['研究', '学习', '工作', '实验'] },
    { word: 'progress', meaning: '进步', phonetic: '/ˈprəʊɡres/', example: 'Make progress every day.', exampleCn: '每天进步一点点。', options: ['进步', '结果', '目标', '过程'] },
    { word: 'summary', meaning: '总结', phonetic: '/ˈsʌməri/', example: 'Write a summary of the text.', exampleCn: '写一篇课文总结。', options: ['总结', '报告', '文章', '笔记'] },
    { word: 'strategy', meaning: '策略', phonetic: '/ˈstrætədʒi/', example: 'We need a good strategy.', exampleCn: '我们需要一个好策略。', options: ['策略', '方法', '计划', '目标'] },
    { word: 'standard', meaning: '标准', phonetic: '/ˈstændəd/', example: 'High standard of living.', exampleCn: '高生活水平。', options: ['标准', '水平', '质量', '等级'] },
    { word: 'ancient', meaning: '古代的', phonetic: '/ˈeɪnʃənt/', example: 'China has an ancient history.', exampleCn: '中国有悠久历史。', options: ['古代的', '现代的', '未来的', '当代的'] },
    { word: 'protect', meaning: '保护', phonetic: '/prəˈtekt/', example: 'Protect the environment.', exampleCn: '保护环境。', options: ['保护', '破坏', '改善', '改变'] },
    { word: 'support', meaning: '支持', phonetic: '/səˈpɔːt/', example: 'Thank you for your support.', exampleCn: '谢谢你的支持。', options: ['支持', '反对', '帮助', '鼓励'] },
  ],
  9: [
    { word: 'knowledge', meaning: '知识', phonetic: '/ˈnɒlɪdʒ/', example: 'Knowledge is power.', exampleCn: '知识就是力量。', options: ['知识', '技能', '经验', '智慧'] },
    { word: 'independent', meaning: '独立的', phonetic: '/ˌɪndɪˈpendənt/', example: 'She is very independent.', exampleCn: '她非常独立。', options: ['独立的', '依赖的', '自信的', '勇敢的'] },
    { word: 'responsibility', meaning: '责任', phonetic: '/rɪˌspɒnsəˈbɪləti/', example: 'We have a responsibility to help.', exampleCn: '我们有责任帮助他人。', options: ['责任', '权利', '义务', '自由'] },
    { word: 'contribution', meaning: '贡献', phonetic: '/ˌkɒntrɪˈbjuːʃn/', example: 'Make a contribution to society.', exampleCn: '为社会做贡献。', options: ['贡献', '捐赠', '帮助', '支持'] },
    { word: 'competition', meaning: '比赛；竞争', phonetic: '/ˌkɒmpəˈtɪʃn/', example: 'We won the competition.', exampleCn: '我们赢了比赛。', options: ['比赛', '表演', '活动', '节目'] },
    { word: 'community', meaning: '社区', phonetic: '/kəˈmjuːnəti/', example: 'We serve in the community.', exampleCn: '我们在社区服务。', options: ['社区', '社会', '学校', '公司'] },
    { word: 'explore', meaning: '探索', phonetic: '/ɪkˈsplɔː(r)/', example: 'Explore new ideas.', exampleCn: '探索新想法。', options: ['探索', '发现', '研究', '学习'] },
    { word: 'sustainable', meaning: '可持续的', phonetic: '/səˈsteɪnəbl/', example: 'Sustainable development.', exampleCn: '可持续发展。', options: ['可持续的', '可发展的', '可再生的', '可循环的'] },
    { word: 'profession', meaning: '职业', phonetic: '/prəˈfeʃn/', example: 'Teaching is a noble profession.', exampleCn: '教师是崇高职业。', options: ['职业', '专业', '行业', '工作'] },
    { word: 'inspire', meaning: '激励', phonetic: '/ɪnˈspaɪə(r)/', example: 'Her story inspires me.', exampleCn: '她的故事激励了我。', options: ['激励', '教育', '影响', '改变'] },
    { word: 'determination', meaning: '决心', phonetic: '/dɪˌtɜːmɪˈneɪʃn/', example: 'Success needs determination.', exampleCn: '成功需要决心。', options: ['决心', '毅力', '勇气', '信心'] },
    { word: 'innovation', meaning: '创新', phonetic: '/ˌɪnəˈveɪʃn/', example: 'Innovation drives progress.', exampleCn: '创新推动进步。', options: ['创新', '发明', '创造', '改革'] },
    { word: 'global', meaning: '全球的', phonetic: '/ˈɡləʊbl/', example: 'We live in a global village.', exampleCn: '我们生活在地球村。', options: ['全球的', '国际的', '国家的', '地区的'] },
    { word: 'cooperation', meaning: '合作', phonetic: '/kəʊˌɒpəˈreɪʃn/', example: 'Teamwork needs cooperation.', exampleCn: '团队需要合作。', options: ['合作', '竞争', '沟通', '协调'] },
    { word: 'leadership', meaning: '领导力', phonetic: '/ˈliːdəʃɪp/', example: 'She shows great leadership.', exampleCn: '她展现出领导力。', options: ['领导力', '管理', '组织', '沟通'] },
    { word: 'academic', meaning: '学术的', phonetic: '/ˌækəˈdemɪk/', example: 'Excellent academic records.', exampleCn: '优秀的学业成绩。', options: ['学术的', '专业的', '技术的', '实践的'] },
    { word: 'significant', meaning: '重要的', phonetic: '/sɪɡˈnɪfɪkənt/', example: 'This is a significant day.', exampleCn: '这是重要的一天。', options: ['重要的', '巨大的', '特别的', '奇妙的'] },
    { word: 'enterprise', meaning: '企业', phonetic: '/ˈentəpraɪz/', example: 'Start your own enterprise.', exampleCn: '创办自己的企业。', options: ['企业', '公司', '组织', '机构'] },
    { word: 'perseverance', meaning: '坚持不懈', phonetic: '/ˌpɜːsɪˈvɪərəns/', example: 'Perseverance leads to success.', exampleCn: '坚持不懈带来成功。', options: ['坚持不懈', '努力奋斗', '永不放弃', '勇往直前'] },
    { word: 'potential', meaning: '潜力', phonetic: '/pəˈtenʃl/', example: 'Everyone has great potential.', exampleCn: '每个人都有巨大潜力。', options: ['潜力', '能力', '天赋', '才能'] },
    { word: 'phenomenon', meaning: '现象', phonetic: '/fəˈnɒmɪnən/', example: 'A natural phenomenon.', exampleCn: '自然现象。', options: ['现象', '事件', '情况', '事实'] },
    { word: 'circumstance', meaning: '情况；环境', phonetic: '/ˈsɜːkəmstæns/', example: 'Under no circumstances give up.', exampleCn: '在任何情况下都不要放弃。', options: ['情况', '环境', '条件', '状态'] },
    { word: 'environmental', meaning: '环境的', phonetic: '/ɪnˌvaɪrənˈmentl/', example: 'Environmental protection.', exampleCn: '环境保护。', options: ['环境的', '自然的', '社会的', '经济的'] },
    { word: 'opportunity', meaning: '机会', phonetic: '/ˌɒpəˈtjuːnəti/', example: 'A golden opportunity.', exampleCn: '黄金机会。', options: ['机会', '挑战', '变化', '选择'] },
    { word: 'achievement', meaning: '成绩；成就', phonetic: '/əˈtʃiːvmənt/', example: 'Proud of your achievement.', exampleCn: '为你的成就骄傲。', options: ['成就', '目标', '梦想', '荣誉'] },
    { word: 'ambition', meaning: '雄心；野心', phonetic: '/æmˈbɪʃn/', example: 'She has great ambition.', exampleCn: '她有很大的雄心。', options: ['雄心', '目标', '梦想', '愿望'] },
    { word: 'responsible', meaning: '负责的', phonetic: '/rɪˈspɒnsəbl/', example: 'Be responsible for your actions.', exampleCn: '对自己的行为负责。', options: ['负责的', '自由的', '勇敢的', '诚实的'] },
    { word: 'curiosity', meaning: '好奇心', phonetic: '/ˌkjʊəriˈɒsəti/', example: 'Curiosity drives learning.', exampleCn: '好奇心驱动学习。', options: ['好奇心', '创造力', '想象力', '记忆力'] },
    { word: 'confident', meaning: '自信的', phonetic: '/ˈkɒnfɪdənt/', example: 'I am confident of success.', exampleCn: '我对成功充满信心。', options: ['自信的', '害羞的', '紧张的', '放松的'] },
    { word: 'creative', meaning: '有创造力的', phonetic: '/kriˈeɪtɪv/', example: 'Creative thinking is important.', exampleCn: '创造性思维很重要。', options: ['有创造力的', '有逻辑的', '有耐心的', '有经验的'] },
    { word: 'critical', meaning: '关键的；批评的', phonetic: '/ˈkrɪtɪkl/', example: 'Critical thinking skills.', exampleCn: '批判性思维能力。', options: ['关键的', '重要的', '基本的', '主要的'] },
    { word: 'evidence', meaning: '证据', phonetic: '/ˈevɪdəns/', example: 'Show me the evidence.', exampleCn: '给我看证据。', options: ['证据', '事实', '数据', '信息'] },
    { word: 'analyse', meaning: '分析', phonetic: '/ˈænəlaɪz/', example: 'Analyse the data carefully.', exampleCn: '仔细分析数据。', options: ['分析', '总结', '解释', '描述'] },
    { word: 'evaluate', meaning: '评估', phonetic: '/ɪˈvæljueɪt/', example: 'Evaluate the results.', exampleCn: '评估结果。', options: ['评估', '计算', '测量', '比较'] },
    { word: 'strategy', meaning: '策略', phonetic: '/ˈstrætədʒi/', example: 'Develop a winning strategy.', exampleCn: '制定获胜策略。', options: ['策略', '方法', '计划', '目标'] },
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

  // Load progress on mount: localStorage for all, Supabase overrides for registered users
  useEffect(() => {
    const saved = localStorage.getItem('vocab_progress');
    if (saved) {
      try {
        const p: VocabProgress = JSON.parse(saved);
        setGrade(p.grade); setIndex(p.index); setCorrect(p.correct); setTotal(p.total);
        setLearned(new Set(p.learned));
        if (p.wrongWords?.length) setWrongWords(p.wrongWords.map(w => ({ ...w, phonetic: '', example: '', exampleCn: '', options: [] })));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${SUPABASE_URL}token_transactions?user_id=eq.${user.id}&type=eq.vocab_progress&order=created_at.desc&limit=1`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    }).then(r => r.json()).then(data => {
      if (data?.[0]?.description) {
        try {
          const p: VocabProgress = JSON.parse(data[0].description);
          setGrade(p.grade); setIndex(p.index); setCorrect(p.correct); setTotal(p.total);
          setLearned(new Set(p.learned));
          if (p.wrongWords?.length) setWrongWords(p.wrongWords.map(w => ({ ...w, phonetic: '', example: '', exampleCn: '', options: [] })));
          toast.success('已恢复上次学习进度');
        } catch {}
      }
    }).catch(() => {});
  }, [user?.id]);

  // Save progress to localStorage on every change
  useEffect(() => {
    const p: VocabProgress = {
      grade, index, correct, total,
      learned: Array.from(learned),
      wrongWords: wrongWords.map(w => ({ word: w.word, meaning: w.meaning })),
    };
    localStorage.setItem('vocab_progress', JSON.stringify(p));
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
      setGrade(g => (g === 9 ? 7 : (g + 1) as Grade));
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
          {([7, 8, 9] as Grade[]).map(g => (
            <button key={g} onClick={() => { setGrade(g); setIndex(0); setSelected(null); setAnswered(false); setCorrect(0); setTotal(0); setLearned(new Set()); setWrongWords([]); }}
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
            <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full mb-2">{UNIT_LABELS[word.unit]}</span>
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
