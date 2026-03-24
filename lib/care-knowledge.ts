/**
 * 小马虎 — 专业阿兹海默照护知识库
 * 来源：阿尔茨海默症协会、南方医科大学珠江医院、USC Roybal研究所等
 */

// ─── 每日护理小贴士 ────────────────────────────────────────────────────────────
// 按分类组织，AI助手每天随机推送一条

export const CARE_TIPS: { category: string; icon: string; tips: string[] }[] = [
  {
    category: '沟通技巧',
    icon: '💬',
    tips: [
      '和老人说话时，请用简短、直白的句子，一次只说一件事，给老人充足的反应时间。',
      '呼唤老人的名字，保持眼神交流，配合温柔的肢体语言，比如轻握手腕，让老人感到被关注。',
      '老人反复问同一个问题时，请保持耐心，不要争论或纠正，用平静的语气重新回答。',
      '如果老人听不懂，换一种更简单的说法，而不是重复原话。',
      '倾听老人话语背后的情绪，您的理解和共情，远比"正确答案"更重要。',
      '避免在老人面前讨论病情或负面话题，保持轻松愉快的交流氛围。',
    ],
  },
  {
    category: '睡眠管理',
    icon: '🌙',
    tips: [
      '保持固定的起床和睡觉时间，规律的作息能减少老人的焦虑和混乱感。',
      '下午3点后避免让老人小睡，以免影响夜间睡眠质量。',
      '睡前可以给老人听一些轻柔的音乐或熟悉的老歌，帮助放松心情。',
      '傍晚时分（日落综合症高发期），尽量减少刺激，保持环境安静、光线柔和。',
      '白天适当的户外活动和阳光照射，有助于调节老人的生物钟，改善夜间睡眠。',
      '睡前避免咖啡因和大量饮水，减少夜间起床次数。',
    ],
  },
  {
    category: '用药管理',
    icon: '💊',
    tips: [
      '老人服药时要有人在旁陪伴，确认药物全部服下，避免遗忘或错服。',
      '将药物放在老人拿不到的地方，防止重复服药或误服。',
      '可以使用分药盒，按早中晚分装好，方便核查是否按时服药。',
      '如果老人拒绝服药，不要强迫，可以稍等片刻，换个方式引导，或咨询医生是否可以换剂型。',
      '定期复查，及时告知医生老人的用药反应和行为变化，药物副作用可能影响情绪和行为。',
    ],
  },
  {
    category: '饮食营养',
    icon: '🥗',
    tips: [
      '为老人准备质地柔软、小块状、易于吞咽的食物，降低呛咳风险。',
      '使用颜色鲜艳的餐具，帮助老人区分食物和盘子，提高进食兴趣。',
      '定时提醒老人进餐，并陪伴一起吃饭，营造愉快的用餐氛围。',
      '推荐地中海饮食：多蔬果、鱼类、全谷物、豆类，有助于大脑健康。',
      '注意老人的饮水量，阿兹海默老人容易忘记喝水，脱水会加重混乱和烦躁。',
      '如果老人忘记自己是否吃过饭，可以用餐后留下餐具作为视觉提示。',
    ],
  },
  {
    category: '日常活动',
    icon: '🌸',
    tips: [
      '每天安排温和的户外散步，阳光和新鲜空气对老人的情绪和睡眠都有帮助。',
      '让老人参与力所能及的家务，如折叠毛巾、擦桌子，保留自尊和成就感。',
      '播放老人年轻时喜欢的音乐，音乐记忆往往保留得比语言记忆更久。',
      '翻看老照片是很好的互动方式，能激发老人的回忆，带来愉悦感。',
      '简单的手工活动，如拼图、穿珠子，有助于维持老人的精细动作能力。',
      '活动安排在老人状态最好的时间段（通常是上午），避免疲劳时强迫参与。',
    ],
  },
  {
    category: '安全防护',
    icon: '🛡️',
    tips: [
      '在浴室和楼梯旁安装扶手，地面铺防滑垫，减少跌倒风险。',
      '将尖锐物品、清洁剂、药物等危险品锁起来或放到老人找不到的地方。',
      '在房门上贴老人熟悉的照片或标识，帮助老人识别自己的房间。',
      '老人外出时，确保随身携带写有姓名、地址、紧急联系人的卡片。',
      '保持家居环境整洁，减少地面障碍物，降低绊倒风险。',
    ],
  },
  {
    category: '情绪应对',
    icon: '💛',
    tips: [
      '当老人出现烦躁或攻击行为时，先保持冷静，检查是否有身体不适（饥饿、疼痛、需要如厕）。',
      '转移注意力是应对异常行为的好方法：用老人喜欢的音乐、零食或活动引导到愉快的事情上。',
      '老人的异常行为不是故意的，是疾病造成的。请不要把情绪发泄在老人身上。',
      '给老人温暖的拥抱和真诚的微笑，即使记忆模糊，老人对情感的感知依然敏锐。',
      '多给老人赞美和鼓励，"您今天做得很好！"这样的话能带给老人极大的满足感。',
    ],
  },
  {
    category: '照顾者自我关爱',
    icon: '🌈',
    tips: [
      '照顾他人之前，先照顾好自己。您的身心健康，是给老人最好的礼物。',
      '每天给自己留出哪怕10分钟的独处时间，做深呼吸、散步或喝杯茶。',
      '不要一个人扛所有事情，勇敢向家人、朋友或社区寻求帮助。',
      '允许自己有负面情绪，感到疲惫、委屈、甚至愤怒都是正常的，不要因此自责。',
      '加入照顾者支持团体，与有相同经历的人分享，会让您感到不那么孤单。',
      '记录自己的感受，写日记是释放情绪、整理思路的好方法。',
      '定期给自己安排"喘息时间"，让其他家人或专业人员暂时接手照护工作。',
    ],
  },
];

// ─── 每日鼓励语 ───────────────────────────────────────────────────────────────
// AI助手根据情绪分数和日记内容选择合适的鼓励语

export const ENCOURAGEMENTS = {
  // 情绪分数 1-3（低落）
  low: [
    '今日状态偏低，建议适当减少外出活动，以休息为主',
    '情绪波动较大时，简单规律的作息更有助于稳定状态',
    '状态不佳时属于正常波动，建议记录具体表现以便追踪',
    '今日精力不足，可简化照护流程，优先保障饮食和用药',
    '如持续低落超过三天，建议咨询专业医护人员',
  ],
  medium: [
    '整体状态一般，建议保持现有照护节奏',
    '今日状态平稳，可留意情绪和饮食变化',
    '照护情况正常，注意观察是否有新的变化',
    '状态尚可，建议适当安排一些轻度活动',
    '今日表现中等，继续保持规律作息即可',
  ],
  high: [
    '今日状态良好，适合安排户外活动或社交',
    '整体表现不错，可以尝试一些认知训练活动',
    '状态稳定，是进行愉快互动的好时机',
    '各项指标正常，建议维持当前照护方案',
    '今日精神状态好，可安排老人喜欢的活动',
  ],
  checkinComplete: [
    '今日打卡已完成，记录已保存',
    '打卡完成，数据已同步',
    '今日记录已保存，稍后可查看分析',
    '记录完成，今日照护数据已更新',
    '打卡完成，可前往分析页查看详情',
  ],
};

// ─── 问候语（按时间段）────────────────────────────────────────────────────────

export function getDayGreeting(caregiverName?: string): string {
  const hour = new Date().getHours();
  const name = caregiverName || '';
  const prefix = name ? `${name}，` : '';
  if (hour >= 5 && hour < 9) return `${prefix}早上好`;
  if (hour >= 9 && hour < 12) return `${prefix}上午好`;
  if (hour >= 12 && hour < 14) return `${prefix}中午好`;
  if (hour >= 14 && hour < 18) return `${prefix}下午好`;
  if (hour >= 18 && hour < 21) return `${prefix}晚上好`;
  return `${prefix}夜深了，注意休息`;
}

// ─── 随机获取一条护理贴士 ─────────────────────────────────────────────────────

export function getRandomTip(): { category: string; icon: string; tip: string } {
  const allTips = CARE_TIPS.flatMap(c =>
    c.tips.map(tip => ({ category: c.category, icon: c.icon, tip }))
  );
  const idx = Math.floor(Math.random() * allTips.length);
  return allTips[idx];
}

// ─── 根据情绪分数获取鼓励语 ──────────────────────────────────────────────────

export function getEncouragement(moodScore: number, type?: 'checkinComplete'): string {
  if (type === 'checkinComplete') {
    const arr = ENCOURAGEMENTS.checkinComplete;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  let arr: string[];
  if (moodScore <= 3) arr = ENCOURAGEMENTS.low;
  else if (moodScore <= 6) arr = ENCOURAGEMENTS.medium;
  else arr = ENCOURAGEMENTS.high;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── 每日打卡问题 ─────────────────────────────────────────────────────────────

export const CHECKIN_QUESTIONS = [
  {
    id: 'sleep',
    step: 1,
    question: '长辈昨晚睡得怎么样？',
    subtitle: '好的睡眠对老人非常重要',
    options: [
      { label: '睡得很好', emoji: '😴', value: 'good', score: 3 },
      { label: '一般般', emoji: '😐', value: 'fair', score: 2 },
      { label: '睡得不好', emoji: '😟', value: 'poor', score: 1 },
    ],
    followUp: {
      label: '大概睡了几小时？',
      type: 'hours' as const,
    },
  },
  {
    id: 'mood',
    step: 2,
    question: '长辈今天心情怎么样？',
    subtitle: '情绪状态帮助我们了解老人的感受',
    options: [
      { label: '开心愉快', emoji: '😊', value: 'happy', score: 10 },
      { label: '平静安稳', emoji: '😌', value: 'calm', score: 7 },
      { label: '有点烦躁', emoji: '😤', value: 'agitated', score: 4 },
      { label: '情绪低落', emoji: '😢', value: 'sad', score: 2 },
    ],
  },
  {
    id: 'medication',
    step: 3,
    question: '今天的药都按时吃了吗？',
    subtitle: '规律用药对老人的健康至关重要',
    options: [
      { label: '全部吃了', emoji: '✅', value: 'all', taken: true },
      { label: '吃了一部分', emoji: '⚠️', value: 'partial', taken: true },
      { label: '今天没吃', emoji: '❌', value: 'none', taken: false },
      { label: '今天不需要吃', emoji: '💊', value: 'na', taken: true },
    ],
  },
];

// ─── 情绪表情选项（日记用）────────────────────────────────────────────────────

export const MOOD_OPTIONS = [
  { emoji: '😄', label: '非常开心', score: 10 },
  { emoji: '😊', label: '开心', score: 8 },
  { emoji: '😌', label: '平静', score: 6 },
  { emoji: '😐', label: '一般', score: 5 },
  { emoji: '😟', label: '有点难过', score: 3 },
  { emoji: '😢', label: '难过', score: 2 },
  { emoji: '😤', label: '烦躁', score: 2 },
  { emoji: '😴', label: '很累', score: 3 },
];

// ─── 药物颜色选项 ─────────────────────────────────────────────────────────────

export const PILL_COLORS = [
  { label: '粉色', value: '#FFB3C6' },
  { label: '蓝色', value: '#A8D8EA' },
  { label: '黄色', value: '#FFE08A' },
  { label: '绿色', value: '#B5EAD7' },
  { label: '橙色', value: '#FFCBA4' },
  { label: '紫色', value: '#C9B1FF' },
];
