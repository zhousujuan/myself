window.GOOGLE_PATH_DATA = {
  assets: ["关键词矩阵", "客户公司表", "联系人表", "触达记录", "复盘指标"],
  stages: [
    {
      id: "market-keywords",
      tag: "准备",
      title: "拆产品、场景和国家关键词",
      summary: "先把产品词、行业应用、目标国家、采购角色和客户类型拆成关键词矩阵，避免外贸员只用一个产品词盲搜。",
      goal: "形成可复用关键词池",
      output: "产品词 + 场景词 + 国家词",
      signals: ["产品别名", "应用行业", "目标国家"],
      checks: ["关键词覆盖产品英文名、别名、型号和应用场景。", "每个目标国家至少有 5 组本地化搜索词。", "区分 buyer、importer、distributor、wholesaler、manufacturer 等客户类型。"],
      actions: ["从历史询盘提取客户真实用词。", "把产品词和国家、行业、客户类型组合。", "标记高毛利、高复购、高认证门槛的关键词。"],
      queries: [
        { label: "进口商", command: "\"product name\" importer \"country\"", use: "找直接采购或进口贸易公司" },
        { label: "经销商", command: "\"product name\" distributor \"country\"", use: "找本地渠道商和代理" },
        { label: "应用场景", command: "\"product name\" \"industry application\"", use: "找更接近需求的行业页面" }
      ]
    },
    {
      id: "google-operators",
      tag: "搜索",
      title: "用 Google 指令批量发现公司",
      summary: "用 site、intitle、inurl、filetype 和引号精确匹配，把搜索结果从泛流量压缩成公司官网、目录页、采购页和渠道页。",
      goal: "发现目标公司官网",
      output: "候选客户公司表",
      signals: ["公司官网", "Contact 页面", "产品目录"],
      checks: ["搜索结果是目标市场公司，而不是同行供应商。", "公司页面出现目标产品、应用场景或采购角色。", "能找到官网、地址、电话、邮箱或社媒入口。"],
      actions: ["先跑宽词，再用国家域名和客户类型收窄。", "把每条有效搜索式保存到团队指令库。", "对同一关键词切换 importer、dealer、wholesale、supplier 等词。"],
      queries: [
        { label: "国家域名", command: "site:.de \"product name\" distributor", use: "按国家域名找本地分销商" },
        { label: "标题命中", command: "intitle:\"distributor\" \"product name\"", use: "找标题明确包含渠道身份的网站" },
        { label: "目录文件", command: "filetype:pdf \"product name\" catalog distributor", use: "从 PDF 型录反查公司和品牌" }
      ]
    },
    {
      id: "company-fit",
      tag: "筛选",
      title: "判断公司是否值得开发",
      summary: "进入官网后快速判断它是潜在买家、渠道商、集成商、终端客户还是同行，并给出开发优先级。",
      goal: "过滤无效名单",
      output: "A级/B级/C级客户池",
      signals: ["产品匹配", "公司规模", "区域覆盖"],
      checks: ["网站有目标产品或相邻品类。", "有明确国家、仓库、门店、项目或客户案例。", "不是只做零售小单、不是明显同行工厂、不是信息过旧网站。"],
      actions: ["记录公司类型、国家、主营产品和匹配理由。", "用 About、Brands、Projects、Catalog 判断业务深度。", "把高匹配客户标记为 A 级优先跟进。"],
      queries: [
        { label: "官网内搜", command: "site:company.com \"product name\"", use: "确认该公司是否经营目标产品" },
        { label: "品牌页", command: "site:company.com brands OR partners", use: "判断是否代理多个供应商品牌" },
        { label: "项目页", command: "site:company.com projects \"product name\"", use: "发现工程型或方案型采购线索" }
      ]
    },
    {
      id: "contact-mining",
      tag: "联系人",
      title: "挖掘决策人和有效邮箱",
      summary: "在公司官网、Google 结果页和 LinkedIn 公开页面中寻找采购、业务、技术或老板角色，补齐可触达联系人。",
      goal: "找到可触达的人",
      output: "联系人 + 邮箱 + 角色",
      signals: ["采购角色", "邮箱格式", "LinkedIn 资料"],
      checks: ["优先找采购、产品、业务发展、技术负责人或老板。", "邮箱格式来自官网或公开页面，不靠猜测批量发送。", "同一公司至少记录 1 个公共邮箱和 1 个角色联系人。"],
      actions: ["检查 Contact、Team、About、Imprint、Privacy 页面。", "用 Google 搜索公司域名加职位关键词。", "记录邮箱来源和联系人职位，方便后续个性化。"],
      queries: [
        { label: "邮箱", command: "site:company.com email OR contact \"product name\"", use: "从官网页面找公开邮箱" },
        { label: "职位", command: "\"company name\" \"purchasing manager\"", use: "找采购或供应链角色" },
        { label: "LinkedIn", command: "site:linkedin.com/in \"company name\" \"procurement\"", use: "从公开资料确认角色" }
      ]
    },
    {
      id: "lead-scoring",
      tag: "入库",
      title: "给线索评分并写入 CRM",
      summary: "把 Google 搜到的公司变成可管理线索，按 ICP 匹配、采购意图、联系人完整度和开发价值分配优先级。",
      goal: "销售优先级清晰",
      output: "CRM 线索记录",
      signals: ["ICP 匹配", "意图证据", "联系人完整度"],
      checks: ["每条线索有国家、公司类型、主营品类、官网、联系人和来源搜索式。", "评分能解释为什么现在值得联系。", "重复公司不会被多人重复开发。"],
      actions: ["设置 A/B/C 三级评分。", "把搜索式和命中页面保存到 CRM 备注。", "为 A 级客户安排当天触达。"],
      queries: [
        { label: "新闻", command: "\"company name\" expansion OR new facility", use: "给高价值客户补充触发事件" },
        { label: "采购", command: "\"company name\" RFQ OR tender \"product name\"", use: "确认近期采购窗口" },
        { label: "进口", command: "\"company name\" import \"product name\"", use: "辅助判断是否有进口记录" }
      ]
    },
    {
      id: "personalized-outreach",
      tag: "触达",
      title: "写个性化开场并启动跟进",
      summary: "根据官网证据、产品匹配和角色关注点写第一封邮件，后续用 Google 发现的新信息持续补充触达理由。",
      goal: "提高回复率",
      output: "邮件序列 + 跟进任务",
      signals: ["业务证据", "痛点假设", "证明资产"],
      checks: ["第一句话能说明为什么找这家公司。", "邮件只讲一个清晰价值点，不堆产品目录。", "包含案例、认证或样品下一步，并尊重退订。"],
      actions: ["引用官网上的产品、项目、品牌或国家覆盖信息。", "按采购、技术、老板角色改写价值主张。", "设置 3-4 次跟进节奏并记录回复结果。"],
      queries: [
        { label: "开场证据", command: "site:company.com \"product name\" OR \"application\"", use: "找邮件第一句话的个性化依据" },
        { label: "案例匹配", command: "\"industry\" \"product name\" case study", use: "准备同场景证明材料" },
        { label: "近期动态", command: "\"company name\" news OR launch OR project", use: "找最近事件作为触达切入点" }
      ]
    },
    {
      id: "review-loop",
      tag: "复盘",
      title: "复盘搜索词和回复质量",
      summary: "每天复盘哪些 Google 搜索式带来了有效公司、有效联系人和正向回复，把个人经验沉淀成团队资产。",
      goal: "优化搜索效率",
      output: "有效指令库 + 复盘指标",
      signals: ["有效公司率", "邮箱有效率", "回复率"],
      checks: ["区分搜索结果数量和有效客户数量。", "记录每个搜索式带来的 A 级客户比例。", "把低质量搜索词加入停用清单。"],
      actions: ["统计每 30 家公司的有效率。", "复盘正向回复邮件的开场和客户类型。", "每周更新关键词矩阵和搜索指令库。"],
      queries: [
        { label: "替代词", command: "\"product synonym\" distributor \"country\"", use: "测试别名是否带来更好结果" },
        { label: "竞品客户", command: "\"competitor brand\" distributor \"country\"", use: "发现已有采购认知的公司" },
        { label: "停用词", command: "\"product name\" retail cheap", use: "识别容易带来低质量结果的词" }
      ]
    }
  ],
  operators: [
    { name: "精确匹配", command: "\"关键词\"", note: "锁定产品名、型号、公司名或采购角色。" },
    { name: "站内搜索", command: "site:domain.com keyword", note: "验证某家公司官网是否经营目标产品。" },
    { name: "国家域名", command: "site:.fr keyword distributor", note: "按目标国家缩小搜索范围。" },
    { name: "标题搜索", command: "intitle:\"importer\" keyword", note: "寻找页面标题中带客户身份的结果。" },
    { name: "网址搜索", command: "inurl:distributor keyword", note: "找渠道页、目录页、产品页。" },
    { name: "文件搜索", command: "filetype:pdf keyword catalog", note: "从型录、报价单、展会资料中反查公司。" }
  ],
  routine: [
    { time: "09:00", task: "跑 3 组关键词", result: "新增候选公司 30 家" },
    { time: "10:30", task: "官网筛选与评级", result: "沉淀 A 级客户 8-10 家" },
    { time: "14:00", task: "联系人和邮箱补全", result: "每家公司至少 1 个触达入口" },
    { time: "16:00", task: "个性化邮件与 CRM 任务", result: "发送 5 封高质量开发信" },
    { time: "17:30", task: "复盘有效搜索式", result: "更新关键词库和停用词" }
  ]
};
