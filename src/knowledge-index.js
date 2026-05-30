/**
 * 知识库清单 —— 这是整个知识库的唯一数据源。
 *
 * 每加一篇知识，就在对应分类的 items 里加一条；
 * knowledge.html 的卡片、搜索、筛选都会自动更新，无需改其它代码。
 *
 * 字段说明：
 *   title    标题
 *   summary  一句话说明（卡片上展示）
 *   tags     标签数组，用于搜索和筛选
 *   status   "在学" | "已沉淀"
 *   url      单篇页面地址；留空或不写 = 还没整理（卡片显示"整理中"，不可点）
 *   forBoss  true = 这条会出现在首页「给 Boss 的职业快照」里
 *   updated  最近更新（可选，YYYY-MM）
 */
window.KNOWLEDGE = [
  {
    key: "career",
    label: "职业",
    icon: "🎯",
    accent: "blue",
    desc: "同时也是给招聘方看的能力证据",
    items: [
      {
        title: "外贸获客与触达",
        summary: "按信号强度整理的获客渠道库、触达节奏与 CRM 字段交接 SOP。",
        tags: ["外贸", "获客", "触达", "SOP"],
        status: "已沉淀",
        url: "trade.html",
        forBoss: true,
        updated: "2026-05",
      },
      {
        title: "AI 产品方法",
        summary: "AI 应用设计、智能体编排、需求抽象到可验证版本的方法论。",
        tags: ["AI", "产品", "PM", "Agent"],
        status: "在学",
        forBoss: true,
      },
      {
        title: "全栈开发",
        summary: "前端、接口联调、部署上线的实操笔记，偏工程落地。",
        tags: ["前端", "全栈", "部署"],
        status: "已沉淀",
        forBoss: true,
      },
    ],
  },
  {
    key: "create",
    label: "创作",
    icon: "🎬",
    accent: "teal",
    desc: "把想法做成看得见的作品",
    items: [
      {
        title: "视频剪辑",
        summary: "剪辑节奏、调色、转场与成片思路的学习笔记。",
        tags: ["剪辑", "调色", "视频"],
        status: "在学",
      },
    ],
  },
  {
    key: "talent",
    label: "才艺",
    icon: "🎵",
    accent: "amber",
    desc: "乐器与舞蹈的练习记录",
    items: [
      {
        title: "古筝入门",
        summary: "从坐姿、指法到第一首曲子的入门练习路径与心得。",
        tags: ["古筝", "乐器", "入门"],
        status: "在学",
        url: "k/guzheng-rumen.html",
        updated: "2026-05",
      },
      {
        title: "钢琴",
        summary: "识谱、手型、练习曲目与卡点记录。",
        tags: ["钢琴", "乐器"],
        status: "在学",
      },
      {
        title: "吉他",
        summary: "和弦、扫弦节奏型与弹唱曲库。",
        tags: ["吉他", "乐器"],
        status: "在学",
      },
      {
        title: "架子鼓",
        summary: "基础节奏型、四肢协调与练习曲目。",
        tags: ["架子鼓", "乐器", "节奏"],
        status: "在学",
      },
      {
        title: "舞蹈交流学习",
        summary: "动作拆解、编舞思路与交流学习笔记。",
        tags: ["舞蹈", "编舞"],
        status: "在学",
      },
    ],
  },
  {
    key: "game",
    label: "游戏",
    icon: "🎮",
    accent: "rose",
    desc: "把游戏也玩成可复盘的体系",
    items: [
      {
        title: "王者荣耀",
        summary: "英雄理解、对线节奏与团战决策复盘。",
        tags: ["王者荣耀", "MOBA", "复盘"],
        status: "在学",
      },
      {
        title: "三角洲行动",
        summary: "枪法、地图点位与战术配合记录。",
        tags: ["三角洲", "FPS", "战术"],
        status: "在学",
      },
    ],
  },
];
