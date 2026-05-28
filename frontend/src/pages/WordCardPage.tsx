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
  0: 'Starter', 1: 'Unit 1', 2: 'Unit 2', 3: 'Unit 3', 4: 'Unit 4', 5: 'Unit 5', 6: 'Unit 6', 7: 'Unit 7',
};

const WORD_DATA: Record<Grade, Word[]> = {
  7: [
    // Starter
    { word: 'good', meaning: '好的', phonetic: '/ɡʊd/', example: 'Good morning!', exampleCn: '早上好！', options: ['好的', '坏的', '大的', '小的'], unit: 0 },
    { word: 'morning', meaning: '早晨', phonetic: '/ˈmɔːnɪŋ/', example: 'I get up in the morning.', exampleCn: '我早上起床。', options: ['早晨', '下午', '晚上', '中午'], unit: 0 },
    { word: 'afternoon', meaning: '下午', phonetic: '/ˌɑːftəˈnuːn/', example: 'Good afternoon!', exampleCn: '下午好！', options: ['早晨', '下午', '晚上', '中午'], unit: 0 },
    { word: 'evening', meaning: '傍晚', phonetic: '/ˈiːvnɪŋ/', example: 'Good evening!', exampleCn: '晚上好！', options: ['早晨', '下午', '晚上', '中午'], unit: 0 },
    { word: 'hello', meaning: '你好', phonetic: '/həˈləʊ/', example: 'Hello, I\'m Li Ming.', exampleCn: '你好，我是李明。', options: ['你好', '再见', '谢谢', '对不起'], unit: 0 },
    { word: 'yes', meaning: '是的', phonetic: '/jes/', example: 'Yes, I can.', exampleCn: '是的，我能。', options: ['是的', '不是', '好的', '也许'], unit: 0 },
    { word: 'no', meaning: '不', phonetic: '/nəʊ/', example: 'No, I can\'t.', exampleCn: '不，我不能。', options: ['是的', '不', '好的', '也许'], unit: 0 },
    { word: 'please', meaning: '请', phonetic: '/pliːz/', example: 'Please sit down.', exampleCn: '请坐下。', options: ['请', '谢谢', '对不起', '不客气'], unit: 0 },
    { word: 'thanks', meaning: '谢谢', phonetic: '/θæŋks/', example: 'Thanks for your help.', exampleCn: '谢谢你的帮助。', options: ['请', '谢谢', '对不起', '不客气'], unit: 0 },
    { word: 'fine', meaning: '好的；健康的', phonetic: '/faɪn/', example: 'I\'m fine, thank you.', exampleCn: '我很好，谢谢。', options: ['好的', '坏的', '累的', '生病的'], unit: 0 },
    { word: 'OK', meaning: '好；行', phonetic: '/ˌəʊˈkeɪ/', example: 'OK, let\'s go.', exampleCn: '好的，我们走吧。', options: ['好', '不好', '也许', '当然'], unit: 0 },
    // Unit 1: My name's Gina (自我介绍)
    { word: 'name', meaning: '名字', phonetic: '/neɪm/', example: 'My name is Tom.', exampleCn: '我的名字是汤姆。', options: ['名字', '年龄', '学校', '班级'], unit: 1 },
    { word: 'meet', meaning: '遇见', phonetic: '/miːt/', example: 'Nice to meet you!', exampleCn: '很高兴见到你！', options: ['遇见', '告别', '欢迎', '感谢'], unit: 1 },
    { word: 'friend', meaning: '朋友', phonetic: '/frend/', example: 'She is my new friend.', exampleCn: '她是我的新朋友。', options: ['老师', '同学', '朋友', '家人'], unit: 1 },
    { word: 'classmate', meaning: '同学', phonetic: '/ˈklɑːsmeɪt/', example: 'We are classmates.', exampleCn: '我们是同学。', options: ['老师', '同学', '朋友', '邻居'], unit: 1 },
    { word: 'teacher', meaning: '老师', phonetic: '/ˈtiːtʃə(r)/', example: 'Mr. Wang is our English teacher.', exampleCn: '王老师是我们的英语老师。', options: ['医生', '老师', '学生', '工人'], unit: 1 },
    { word: 'student', meaning: '学生', phonetic: '/ˈstjuːdnt/', example: 'I am a middle school student.', exampleCn: '我是一名中学生。', options: ['老师', '学生', '医生', '警察'], unit: 1 },
    { word: 'China', meaning: '中国', phonetic: '/ˈtʃaɪnə/', example: 'I\'m from China.', exampleCn: '我来自中国。', options: ['中国', '日本', '美国', '英国'], unit: 1 },
    { word: 'English', meaning: '英语；英国的', phonetic: '/ˈɪŋɡlɪʃ/', example: 'I like English.', exampleCn: '我喜欢英语。', options: ['英语', '数学', '语文', '历史'], unit: 1 },
    { word: 'first', meaning: '第一', phonetic: '/fɜːst/', example: 'This is my first lesson.', exampleCn: '这是我的第一节课。', options: ['第一', '第二', '第三', '最后'], unit: 1 },
    { word: 'last', meaning: '最后的', phonetic: '/lɑːst/', example: 'This is the last one.', exampleCn: '这是最后一个。', options: ['第一', '最后', '下一个', '之前的'], unit: 1 },
    { word: 'telephone', meaning: '电话', phonetic: '/ˈtelɪfəʊn/', example: 'What\'s your telephone number?', exampleCn: '你的电话号码是多少？', options: ['电话', '手机', '电脑', '邮件'], unit: 1 },
    { word: 'number', meaning: '号码；数字', phonetic: '/ˈnʌmbə(r)/', example: 'My lucky number is 7.', exampleCn: '我的幸运数字是7。', options: ['号码', '字母', '颜色', '名字'], unit: 1 },
    { word: 'zero', meaning: '零', phonetic: '/ˈzɪərəʊ/', example: 'My number ends with zero.', exampleCn: '我的号码末尾是零。', options: ['零', '一', '百', '十'], unit: 1 },
    { word: 'one', meaning: '一', phonetic: '/wʌn/', example: 'I have one book.', exampleCn: '我有一本书。', options: ['一', '二', '三', '四'], unit: 1 },
    { word: 'two', meaning: '二', phonetic: '/tuː/', example: 'I have two sisters.', exampleCn: '我有两个姐妹。', options: ['一', '二', '三', '四'], unit: 1 },
    { word: 'three', meaning: '三', phonetic: '/θriː/', example: 'There are three apples.', exampleCn: '有三个苹果。', options: ['一', '二', '三', '四'], unit: 1 },
    { word: 'four', meaning: '四', phonetic: '/fɔː(r)/', example: 'Four students are here.', exampleCn: '四个学生在这里。', options: ['四', '五', '六', '七'], unit: 1 },
    { word: 'five', meaning: '五', phonetic: '/faɪv/', example: 'I have five fingers.', exampleCn: '我有五根手指。', options: ['五', '六', '七', '八'], unit: 1 },
    // Unit 2: This is my sister (家庭)
    { word: 'family', meaning: '家庭', phonetic: '/ˈfæməli/', example: 'I have a big family.', exampleCn: '我有一个大家庭。', options: ['朋友', '家庭', '学校', '教室'], unit: 2 },
    { word: 'mother', meaning: '母亲', phonetic: '/ˈmʌðə(r)/', example: 'My mother is a doctor.', exampleCn: '我的母亲是一名医生。', options: ['父亲', '母亲', '姐妹', '兄弟'], unit: 2 },
    { word: 'father', meaning: '父亲', phonetic: '/ˈfɑːðə(r)/', example: 'My father is tall.', exampleCn: '我的父亲很高。', options: ['母亲', '父亲', '老师', '医生'], unit: 2 },
    { word: 'brother', meaning: '兄弟', phonetic: '/ˈbrʌðə(r)/', example: 'I have a younger brother.', exampleCn: '我有一个弟弟。', options: ['姐妹', '兄弟', '朋友', '同学'], unit: 2 },
    { word: 'sister', meaning: '姐妹', phonetic: '/ˈsɪstə(r)/', example: 'My sister is eight.', exampleCn: '我的妹妹八岁。', options: ['兄弟', '姐妹', '母亲', '阿姨'], unit: 2 },
    { word: 'grandparent', meaning: '祖父母', phonetic: '/ˈɡrænpeərənt/', example: 'My grandparents live with us.', exampleCn: '我的祖父母和我们住在一起。', options: ['祖父母', '父母', '亲戚', '邻居'], unit: 2 },
    { word: 'grandma', meaning: '奶奶；外婆', phonetic: '/ˈɡrænmɑː/', example: 'I love my grandma.', exampleCn: '我爱我的奶奶。', options: ['奶奶', '爷爷', '妈妈', '阿姨'], unit: 2 },
    { word: 'grandpa', meaning: '爷爷；外公', phonetic: '/ˈɡrænpɑː/', example: 'My grandpa tells stories.', exampleCn: '我的爷爷讲故事。', options: ['奶奶', '爷爷', '爸爸', '叔叔'], unit: 2 },
    { word: 'uncle', meaning: '叔叔；舅舅', phonetic: '/ˈʌŋkl/', example: 'My uncle is a teacher.', exampleCn: '我的叔叔是一名老师。', options: ['叔叔', '阿姨', '堂兄', '邻居'], unit: 2 },
    { word: 'aunt', meaning: '阿姨；姑姑', phonetic: '/ɑːnt/', example: 'My aunt lives in Beijing.', exampleCn: '我的阿姨住在北京。', options: ['叔叔', '阿姨', '堂兄', '邻居'], unit: 2 },
    { word: 'cousin', meaning: '堂（表）兄弟姐妹', phonetic: '/ˈkʌzn/', example: 'My cousin is my good friend.', exampleCn: '我的表弟是我的好朋友。', options: ['堂兄弟', '叔叔', '阿姨', '邻居'], unit: 2 },
    { word: 'parent', meaning: '父亲或母亲', phonetic: '/ˈpeərənt/', example: 'My parents love me.', exampleCn: '我的父母爱我。', options: ['父母', '祖父母', '老师', '亲戚'], unit: 2 },
    { word: 'people', meaning: '人们', phonetic: '/ˈpiːpl/', example: 'There are five people in my family.', exampleCn: '我家有五口人。', options: ['人们', '家庭', '朋友', '邻居'], unit: 2 },
    { word: 'who', meaning: '谁', phonetic: '/huː/', example: 'Who is she?', exampleCn: '她是谁？', options: ['谁', '什么', '哪里', '何时'], unit: 2 },
    { word: 'these', meaning: '这些', phonetic: '/ðiːz/', example: 'These are my books.', exampleCn: '这些是我的书。', options: ['这些', '那些', '这个', '那个'], unit: 2 },
    { word: 'those', meaning: '那些', phonetic: '/ðəʊz/', example: 'Those are my pens.', exampleCn: '那些是我的钢笔。', options: ['这些', '那些', '这个', '那个'], unit: 2 },
    // Unit 3: Is this your pencil? (教室物品)
    { word: 'pencil', meaning: '铅笔', phonetic: '/ˈpensl/', example: 'Is this your pencil?', exampleCn: '这是你的铅笔吗？', options: ['铅笔', '钢笔', '尺子', '橡皮'], unit: 3 },
    { word: 'pen', meaning: '钢笔', phonetic: '/pen/', example: 'This is my pen.', exampleCn: '这是我的钢笔。', options: ['铅笔', '钢笔', '尺子', '橡皮'], unit: 3 },
    { word: 'book', meaning: '书', phonetic: '/bʊk/', example: 'I have a new book.', exampleCn: '我有一本新书。', options: ['书', '笔', '本子', '尺子'], unit: 3 },
    { word: 'ruler', meaning: '尺子', phonetic: '/ˈruːlə(r)/', example: 'My ruler is long.', exampleCn: '我的尺子很长。', options: ['铅笔', '钢笔', '尺子', '橡皮'], unit: 3 },
    { word: 'eraser', meaning: '橡皮', phonetic: '/ɪˈreɪzə(r)/', example: 'I need an eraser.', exampleCn: '我需要一块橡皮。', options: ['铅笔', '钢笔', '尺子', '橡皮'], unit: 3 },
    { word: 'schoolbag', meaning: '书包', phonetic: '/ˈskuːlbæɡ/', example: 'My schoolbag is heavy.', exampleCn: '我的书包很重。', options: ['书包', '铅笔盒', '书本', '词典'], unit: 3 },
    { word: 'dictionary', meaning: '词典', phonetic: '/ˈdɪkʃənri/', example: 'Look it up in the dictionary.', exampleCn: '在词典里查一下。', options: ['词典', '课本', '笔记本', '练习册'], unit: 3 },
    { word: 'notebook', meaning: '笔记本', phonetic: '/ˈnəʊtbʊk/', example: 'Write it in your notebook.', exampleCn: '把它写在笔记本上。', options: ['课本', '笔记本', '作业本', '练习册'], unit: 3 },
    { word: 'classroom', meaning: '教室', phonetic: '/ˈklɑːsruːm/', example: 'Our classroom is clean.', exampleCn: '我们的教室很干净。', options: ['图书馆', '教室', '办公室', '食堂'], unit: 3 },
    { word: 'school', meaning: '学校', phonetic: '/skuːl/', example: 'Our school is beautiful.', exampleCn: '我们的学校很漂亮。', options: ['家庭', '公园', '学校', '医院'], unit: 3 },
    { word: 'library', meaning: '图书馆', phonetic: '/ˈlaɪbrəri/', example: 'I read in the library.', exampleCn: '我在图书馆读书。', options: ['教室', '体育馆', '图书馆', '食堂'], unit: 3 },
    { word: 'teacher', meaning: '老师', phonetic: '/ˈtiːtʃə(r)/', example: 'The teacher is kind.', exampleCn: '老师很和蔼。', options: ['医生', '老师', '学生', '工人'], unit: 3 },
    { word: 'student', meaning: '学生', phonetic: '/ˈstjuːdnt/', example: 'Good students study hard.', exampleCn: '好学生努力学习。', options: ['老师', '学生', '医生', '警察'], unit: 3 },
    { word: 'help', meaning: '帮助', phonetic: '/help/', example: 'Can you help me?', exampleCn: '你能帮我吗？', options: ['帮助', '学习', '工作', '玩耍'], unit: 3 },
    { word: 'thank', meaning: '感谢', phonetic: '/θæŋk/', example: 'Thank you for your help.', exampleCn: '谢谢你的帮助。', options: ['感谢', '抱歉', '请求', '欢迎'], unit: 3 },
    // Unit 4: Where's my schoolbag? (物品位置)
    { word: 'where', meaning: '在哪里', phonetic: '/weə(r)/', example: 'Where is my pen?', exampleCn: '我的钢笔在哪里？', options: ['在哪里', '是什么', '是谁', '为什么'], unit: 4 },
    { word: 'on', meaning: '在…上', phonetic: '/ɒn/', example: 'The book is on the desk.', exampleCn: '书在书桌上。', options: ['在…上', '在…里', '在…下', '在…旁边'], unit: 4 },
    { word: 'in', meaning: '在…里', phonetic: '/ɪn/', example: 'My pencil is in the bag.', exampleCn: '我的铅笔在书包里。', options: ['在…上', '在…里', '在…下', '在…旁边'], unit: 4 },
    { word: 'under', meaning: '在…下', phonetic: '/ˈʌndə(r)/', example: 'The cat is under the chair.', exampleCn: '猫在椅子下面。', options: ['在…上', '在…里', '在…下', '在…旁边'], unit: 4 },
    { word: 'desk', meaning: '书桌', phonetic: '/desk/', example: 'There is a lamp on the desk.', exampleCn: '书桌上有一盏台灯。', options: ['书桌', '椅子', '床', '书架'], unit: 4 },
    { word: 'chair', meaning: '椅子', phonetic: '/tʃeə(r)/', example: 'Sit on the chair.', exampleCn: '坐在椅子上。', options: ['书桌', '椅子', '床', '书架'], unit: 4 },
    { word: 'bed', meaning: '床', phonetic: '/bed/', example: 'My bed is comfortable.', exampleCn: '我的床很舒服。', options: ['书桌', '椅子', '床', '沙发'], unit: 4 },
    { word: 'room', meaning: '房间', phonetic: '/ruːm/', example: 'My room is tidy.', exampleCn: '我的房间很整洁。', options: ['房间', '房子', '教室', '花园'], unit: 4 },
    { word: 'table', meaning: '桌子', phonetic: '/ˈteɪbl/', example: 'The flowers are on the table.', exampleCn: '花在桌子上。', options: ['桌子', '椅子', '床', '柜子'], unit: 4 },
    { word: 'bookcase', meaning: '书架', phonetic: '/ˈbʊkkeɪs/', example: 'Books are in the bookcase.', exampleCn: '书在书架上。', options: ['书架', '书桌', '书包', '铅笔盒'], unit: 4 },
    { word: 'sofa', meaning: '沙发', phonetic: '/ˈsəʊfə/', example: 'My father sits on the sofa.', exampleCn: '我爸爸坐在沙发上。', options: ['沙发', '椅子', '床', '桌子'], unit: 4 },
    { word: 'think', meaning: '认为；想', phonetic: '/θɪŋk/', example: 'I think it\'s a good idea.', exampleCn: '我认为这是个好主意。', options: ['认为', '知道', '相信', '希望'], unit: 4 },
    { word: 'know', meaning: '知道', phonetic: '/nəʊ/', example: 'I know the answer.', exampleCn: '我知道答案。', options: ['知道', '认为', '相信', '学习'], unit: 4 },
    { word: 'come', meaning: '来', phonetic: '/kʌm/', example: 'Come here, please.', exampleCn: '请过来。', options: ['来', '去', '走', '跑'], unit: 4 },
    { word: 'go', meaning: '去', phonetic: '/ɡəʊ/', example: 'Let\'s go to school.', exampleCn: '我们去学校吧。', options: ['来', '去', '走', '跑'], unit: 4 },
    // Unit 5: Do you have a soccer ball? (体育用品)
    { word: 'have', meaning: '有', phonetic: '/hæv/', example: 'I have a basketball.', exampleCn: '我有一个篮球。', options: ['有', '没有', '想要', '喜欢'], unit: 5 },
    { word: 'ball', meaning: '球', phonetic: '/bɔːl/', example: 'The ball is red.', exampleCn: '球是红色的。', options: ['球', '玩具', '礼物', '奖品'], unit: 5 },
    { word: 'soccer', meaning: '英式足球', phonetic: '/ˈsɒkə(r)/', example: 'We play soccer after school.', exampleCn: '我们放学后踢足球。', options: ['足球', '篮球', '排球', '网球'], unit: 5 },
    { word: 'basketball', meaning: '篮球', phonetic: '/ˈbɑːskɪtbɔːl/', example: 'I like playing basketball.', exampleCn: '我喜欢打篮球。', options: ['足球', '篮球', '排球', '网球'], unit: 5 },
    { word: 'volleyball', meaning: '排球', phonetic: '/ˈvɒlibɔːl/', example: 'She plays volleyball well.', exampleCn: '她排球打得很好。', options: ['足球', '篮球', '排球', '网球'], unit: 5 },
    { word: 'tennis', meaning: '网球', phonetic: '/ˈtenɪs/', example: 'Tennis is interesting.', exampleCn: '网球很有趣。', options: ['足球', '篮球', '排球', '网球'], unit: 5 },
    { word: 'baseball', meaning: '棒球', phonetic: '/ˈbeɪsbɔːl/', example: 'Baseball is popular in America.', exampleCn: '棒球在美国很流行。', options: ['棒球', '篮球', '排球', '网球'], unit: 5 },
    { word: 'bat', meaning: '球拍', phonetic: '/bæt/', example: 'I need a baseball bat.', exampleCn: '我需要一个棒球球拍。', options: ['球拍', '球', '手套', '球鞋'], unit: 5 },
    { word: 'game', meaning: '比赛；游戏', phonetic: '/ɡeɪm/', example: 'We watch a basketball game.', exampleCn: '我们看了一场篮球赛。', options: ['比赛', '课程', '活动', '练习'], unit: 5 },
    { word: 'play', meaning: '玩；打（球）', phonetic: '/pleɪ/', example: 'Let\'s play soccer!', exampleCn: '我们踢足球吧！', options: ['玩', '看', '听', '做'], unit: 5 },
    { word: 'sport', meaning: '体育运动', phonetic: '/spɔːt/', example: 'My favourite sport is basketball.', exampleCn: '我最喜欢的运动是篮球。', options: ['运动', '游戏', '科目', '爱好'], unit: 5 },
    { word: 'great', meaning: '很棒的', phonetic: '/ɡreɪt/', example: 'That sounds great!', exampleCn: '那听起来很棒！', options: ['很棒的', '有趣的', '无聊的', '困难的'], unit: 5 },
    { word: 'fun', meaning: '有趣的', phonetic: '/fʌn/', example: 'The game is fun.', exampleCn: '比赛很有趣。', options: ['有趣的', '无聊的', '困难的', '容易的'], unit: 5 },
    { word: 'boring', meaning: '无聊的', phonetic: '/ˈbɔːrɪŋ/', example: 'This movie is boring.', exampleCn: '这部电影很无聊。', options: ['有趣的', '无聊的', '精彩的', '轻松的'], unit: 5 },
    { word: 'difficult', meaning: '困难的', phonetic: '/ˈdɪfɪkəlt/', example: 'Math is difficult for me.', exampleCn: '数学对我来说很难。', options: ['困难的', '容易的', '有趣的', '重要的'], unit: 5 },
    { word: 'easy', meaning: '容易的', phonetic: '/ˈiːzi/', example: 'This problem is easy.', exampleCn: '这个问题很容易。', options: ['困难的', '容易的', '有趣的', '重要的'], unit: 5 },
    { word: 'relaxing', meaning: '令人放松的', phonetic: '/rɪˈlæksɪŋ/', example: 'Music is relaxing.', exampleCn: '音乐令人放松。', options: ['令人放松的', '令人兴奋的', '令人疲惫的', '令人担忧的'], unit: 5 },
    // Unit 6: Do you like bananas? (食物)
    { word: 'like', meaning: '喜欢', phonetic: '/laɪk/', example: 'I like apples.', exampleCn: '我喜欢苹果。', options: ['喜欢', '讨厌', '想要', '需要'], unit: 6 },
    { word: 'banana', meaning: '香蕉', phonetic: '/bəˈnɑːnə/', example: 'I eat a banana every day.', exampleCn: '我每天吃一根香蕉。', options: ['香蕉', '苹果', '橙子', '梨'], unit: 6 },
    { word: 'apple', meaning: '苹果', phonetic: '/ˈæpl/', example: 'An apple a day keeps the doctor away.', exampleCn: '一天一苹果，医生远离我。', options: ['香蕉', '苹果', '葡萄', '草莓'], unit: 6 },
    { word: 'orange', meaning: '橙子', phonetic: '/ˈɒrɪndʒ/', example: 'This orange is sweet.', exampleCn: '这个橙子很甜。', options: ['苹果', '香蕉', '橙子', '梨'], unit: 6 },
    { word: 'pear', meaning: '梨', phonetic: '/peə(r)/', example: 'The pear is juicy.', exampleCn: '这个梨很多汁。', options: ['苹果', '香蕉', '橙子', '梨'], unit: 6 },
    { word: 'strawberry', meaning: '草莓', phonetic: '/ˈstrɔːbəri/', example: 'I love strawberries.', exampleCn: '我喜欢草莓。', options: ['草莓', '蓝莓', '葡萄', '樱桃'], unit: 6 },
    { word: 'fruit', meaning: '水果', phonetic: '/fruːt/', example: 'Fruit is good for health.', exampleCn: '水果对健康有益。', options: ['水果', '蔬菜', '肉类', '甜点'], unit: 6 },
    { word: 'vegetable', meaning: '蔬菜', phonetic: '/ˈvedʒtəbl/', example: 'Eat more vegetables.', exampleCn: '多吃蔬菜。', options: ['水果', '蔬菜', '肉类', '甜点'], unit: 6 },
    { word: 'tomato', meaning: '西红柿', phonetic: '/təˈmɑːtəʊ/', example: 'I like tomato soup.', exampleCn: '我喜欢西红柿汤。', options: ['西红柿', '土豆', '胡萝卜', '洋葱'], unit: 6 },
    { word: 'egg', meaning: '鸡蛋', phonetic: '/eɡ/', example: 'I have an egg for breakfast.', exampleCn: '我早餐吃一个鸡蛋。', options: ['鸡蛋', '牛奶', '面包', '米饭'], unit: 6 },
    { word: 'bread', meaning: '面包', phonetic: '/bred/', example: 'I like bread and milk.', exampleCn: '我喜欢面包和牛奶。', options: ['面包', '米饭', '面条', '蛋糕'], unit: 6 },
    { word: 'rice', meaning: '米饭', phonetic: '/raɪs/', example: 'We eat rice for lunch.', exampleCn: '我们午餐吃米饭。', options: ['面包', '米饭', '面条', '饺子'], unit: 6 },
    { word: 'chicken', meaning: '鸡肉', phonetic: '/ˈtʃɪkɪn/', example: 'Fried chicken is delicious.', exampleCn: '炸鸡很美味。', options: ['鸡肉', '鱼肉', '牛肉', '猪肉'], unit: 6 },
    { word: 'hamburger', meaning: '汉堡包', phonetic: '/ˈhæmbɜːɡə(r)/', example: 'I like hamburgers.', exampleCn: '我喜欢汉堡包。', options: ['汉堡包', '三明治', '热狗', '比萨'], unit: 6 },
    { word: 'salad', meaning: '沙拉', phonetic: '/ˈsæləd/', example: 'I make a fruit salad.', exampleCn: '我做了一份水果沙拉。', options: ['沙拉', '汤', '果汁', '甜点'], unit: 6 },
    { word: 'milk', meaning: '牛奶', phonetic: '/mɪlk/', example: 'I drink milk every day.', exampleCn: '我每天喝牛奶。', options: ['牛奶', '水', '果汁', '茶'], unit: 6 },
    { word: 'water', meaning: '水', phonetic: '/ˈwɔːtə(r)/', example: 'Drink more water.', exampleCn: '多喝水。', options: ['牛奶', '水', '果汁', '咖啡'], unit: 6 },
    { word: 'food', meaning: '食物', phonetic: '/fuːd/', example: 'Chinese food is great.', exampleCn: '中国食物很棒。', options: ['食物', '饮料', '水果', '蔬菜'], unit: 6 },
    { word: 'breakfast', meaning: '早餐', phonetic: '/ˈbrekfəst/', example: 'I have breakfast at 7.', exampleCn: '我七点吃早餐。', options: ['早餐', '午餐', '晚餐', '甜点'], unit: 6 },
    { word: 'lunch', meaning: '午餐', phonetic: '/lʌntʃ/', example: 'We have lunch at school.', exampleCn: '我们在学校吃午餐。', options: ['早餐', '午餐', '晚餐', '甜点'], unit: 6 },
    { word: 'dinner', meaning: '晚餐', phonetic: '/ˈdɪnə(r)/', example: 'We have dinner together.', exampleCn: '我们一起吃晚餐。', options: ['早餐', '午餐', '晚餐', '甜点'], unit: 6 },
    // Unit 7: How much are these socks? (购物、衣服)
    { word: 'much', meaning: '多；大量', phonetic: '/mʌtʃ/', example: 'How much is it?', exampleCn: '多少钱？', options: ['多', '少', '很多', '很少'], unit: 7 },
    { word: 'price', meaning: '价格', phonetic: '/praɪs/', example: 'The price is low.', exampleCn: '价格很低。', options: ['价格', '大小', '颜色', '款式'], unit: 7 },
    { word: 'buy', meaning: '买', phonetic: '/baɪ/', example: 'I want to buy a gift.', exampleCn: '我想买个礼物。', options: ['买', '卖', '付', '花'], unit: 7 },
    { word: 'sell', meaning: '卖', phonetic: '/sel/', example: 'The store sells clothes.', exampleCn: '这家店卖衣服。', options: ['买', '卖', '付', '花'], unit: 7 },
    { word: 'clothes', meaning: '衣服', phonetic: '/kləʊðz/', example: 'I like these clothes.', exampleCn: '我喜欢这些衣服。', options: ['衣服', '鞋子', '帽子', '袜子'], unit: 7 },
    { word: 'shirt', meaning: '衬衫', phonetic: '/ʃɜːt/', example: 'My shirt is white.', exampleCn: '我的衬衫是白色的。', options: ['衬衫', 'T恤', '外套', '毛衣'], unit: 7 },
    { word: 'T-shirt', meaning: 'T恤衫', phonetic: '/ˈtiːʃɜːt/', example: 'I wear a T-shirt in summer.', exampleCn: '我夏天穿T恤。', options: ['衬衫', 'T恤', '外套', '毛衣'], unit: 7 },
    { word: 'sweater', meaning: '毛衣', phonetic: '/ˈswetə(r)/', example: 'Put on your sweater.', exampleCn: '穿上你的毛衣。', options: ['衬衫', 'T恤', '外套', '毛衣'], unit: 7 },
    { word: 'jacket', meaning: '夹克', phonetic: '/ˈdʒækɪt/', example: 'This jacket is cool.', exampleCn: '这件夹克很酷。', options: ['夹克', '裙子', '裤子', '短裤'], unit: 7 },
    { word: 'skirt', meaning: '裙子', phonetic: '/skɜːt/', example: 'She wears a red skirt.', exampleCn: '她穿了一条红裙子。', options: ['夹克', '裙子', '裤子', '短裤'], unit: 7 },
    { word: 'pants', meaning: '裤子', phonetic: '/pænts/', example: 'These pants are too long.', exampleCn: '这条裤子太长了。', options: ['夹克', '裙子', '裤子', '短裤'], unit: 7 },
    { word: 'shoes', meaning: '鞋子', phonetic: '/ʃuːz/', example: 'My shoes are new.', exampleCn: '我的鞋子是新的。', options: ['鞋子', '袜子', '帽子', '手套'], unit: 7 },
    { word: 'socks', meaning: '袜子', phonetic: '/sɒks/', example: 'I need a pair of socks.', exampleCn: '我需要一双袜子。', options: ['鞋子', '袜子', '帽子', '手套'], unit: 7 },
    { word: 'color', meaning: '颜色', phonetic: '/ˈkʌlə(r)/', example: 'What color is it?', exampleCn: '它是什么颜色？', options: ['颜色', '大小', '形状', '款式'], unit: 7 },
    { word: 'white', meaning: '白色的', phonetic: '/waɪt/', example: 'Snow is white.', exampleCn: '雪是白色的。', options: ['白色的', '黑色的', '红色的', '蓝色的'], unit: 7 },
    { word: 'black', meaning: '黑色的', phonetic: '/blæk/', example: 'My bag is black.', exampleCn: '我的书包是黑色的。', options: ['白色的', '黑色的', '红色的', '蓝色的'], unit: 7 },
    { word: 'red', meaning: '红色的', phonetic: '/red/', example: 'The rose is red.', exampleCn: '玫瑰是红色的。', options: ['红色的', '黑色的', '白色的', '绿色的'], unit: 7 },
    { word: 'blue', meaning: '蓝色的', phonetic: '/bluː/', example: 'The sky is blue.', exampleCn: '天空是蓝色的。', options: ['红色的', '黄色的', '蓝色的', '绿色的'], unit: 7 },
    { word: 'green', meaning: '绿色的', phonetic: '/ɡriːn/', example: 'The grass is green.', exampleCn: '草是绿色的。', options: ['红色的', '黄色的', '蓝色的', '绿色的'], unit: 7 },
    { word: 'big', meaning: '大的', phonetic: '/bɪɡ/', example: 'This is a big apple.', exampleCn: '这是一个大苹果。', options: ['大的', '小的', '长的', '短的'], unit: 7 },
    { word: 'small', meaning: '小的', phonetic: '/smɔːl/', example: 'The cat is small.', exampleCn: '猫很小。', options: ['大的', '小的', '长的', '短的'], unit: 7 },
    { word: 'long', meaning: '长的', phonetic: '/lɒŋ/', example: 'This ruler is long.', exampleCn: '这把尺子很长。', options: ['大的', '小的', '长的', '短的'], unit: 7 },
    { word: 'short', meaning: '短的', phonetic: '/ʃɔːt/', example: 'My hair is short.', exampleCn: '我的头发很短。', options: ['大的', '小的', '长的', '短的'], unit: 7 },
    { word: 'birthday', meaning: '生日', phonetic: '/ˈbɜːθdeɪ/', example: 'Happy birthday to you!', exampleCn: '祝你生日快乐！', options: ['生日', '节日', '假日', '周末'], unit: 7 },
    { word: 'present', meaning: '礼物', phonetic: '/ˈpreznt/', example: 'This is a birthday present.', exampleCn: '这是生日礼物。', options: ['礼物', '蛋糕', '卡片', '花朵'], unit: 7 },
    { word: 'party', meaning: '聚会', phonetic: '/ˈpɑːti/', example: 'We have a birthday party.', exampleCn: '我们举办了生日聚会。', options: ['聚会', '会议', '比赛', '演出'], unit: 7 },
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

  // Load progress: try Supabase first (registered users), then localStorage as fallback
  const [loadedFromRemote, setLoadedFromRemote] = useState(false);

  useEffect(() => {
    if (!user?.id) { setLoadedFromRemote(false); return; }
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
      setLoadedFromRemote(true);
    }).catch(() => setLoadedFromRemote(true));
  }, [user?.id]);

  // Fallback to localStorage if no Supabase data (guest users)
  useEffect(() => {
    if (!loadedFromRemote || (user?.id)) return;
    const saved = localStorage.getItem('vocab_progress');
    if (saved) {
      try {
        const p: VocabProgress = JSON.parse(saved);
        setGrade(p.grade); setIndex(p.index); setCorrect(p.correct); setTotal(p.total);
        setLearned(new Set(p.learned));
        if (p.wrongWords?.length) setWrongWords(p.wrongWords.map(w => ({ ...w, phonetic: '', example: '', exampleCn: '', options: [] })));
      } catch {}
    }
  }, [loadedFromRemote, user?.id]);

  // Save progress to localStorage on every change
  useEffect(() => {
    const p: VocabProgress = {
      grade, index, correct, total,
      learned: Array.from(learned),
      wrongWords: wrongWords.map(w => ({ word: w.word, meaning: w.meaning })),
    };
    localStorage.setItem('vocab_progress', JSON.stringify(p));
  }, [grade, index, correct, total, learned, wrongWords]);

  // Sync to Supabase on every change (debounced)
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
