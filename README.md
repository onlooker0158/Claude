# 资讯整理 Agent

用 Claude Code 自动搜索、交叉验证并整理科技/AI、财经/投资、行业/学术资讯，结果写入 Notion。

## 组成

| 文件 | 作用 |
| --- | --- |
| `.claude/agents/news-curator.md` | 资讯整理子 agent：检索 → 中英文交叉验证 → 去重 → 写入 Notion |
| `.claude/skills/news-brief/SKILL.md` | 手动触发入口 `/news-brief` |
| `config/sources.md` | 关注主题、来源清单、筛选规则（改这里即可调整关注点） |

Notion 数据库：[资讯情报库](https://app.notion.com/p/6de0e4386d054b598d52e71774678117)

## 使用

在本仓库的 Claude Code 会话中输入：

```
/news-brief                    # 三个领域，最近 24 小时
/news-brief 科技               # 只整理科技/AI
/news-brief 财经 最近一周       # 财经/投资，最近一周
/news-brief 学术 ADC 免疫治疗   # 行业/学术，额外关注关键词
```

也可以直接说“帮我整理一下今天的 AI 资讯”，Claude 会调用 `news-curator`。

## 原则

- 结论以中国情况为准；参考英文资料时，同时检索中文内容交叉确认。
- 每条资讯标注交叉验证状态：中英文一致 / 仅中文来源 / 仅英文来源 / 存在分歧。
- 写入前查询近 7 天条目去重；宁缺毋滥。

## 前提

- Claude Code 会话需连接 Notion（以及可选的 PubMed）连接器。

---

# 医学进化框架周报

三个评审 Agent（理性、感性、挑盲区）用进化机制筛选医学长文，每周输出一张思维导图写入 Notion。

## 组成

| 文件 | 作用 |
| --- | --- |
| `.claude/skills/evolve/SKILL.md` | 调度入口 `/evolve`：采集 → 评审 → 选择 → 杂交/突变 → 导图 |
| `.claude/agents/evolve-scout.md` | 采集员：选主题、收集长文、抽成框架基因（第 0 代） |
| `.claude/agents/evolve-rational.md` | 理性：逻辑、证据等级、中国适用性 |
| `.claude/agents/evolve-emotional.md` | 感性：对读者有没有用、好不好记、能不能讲；读取周报里的评价和批注 |
| `.claude/agents/evolve-blindspot.md` | 挑盲区：缺失变量、偏倚、反例、中国语境；同时提供突变 |
| `.claude/agents/evolve-breeder.md` | 繁殖器：按模块杂交、注入突变 |
| `config/evolve.md` | 主题池、读者画像、来源、进化参数、基因格式（改这里即可） |

Notion：[医学进化框架](https://app.notion.com/p/3fd2d4237cc8818dab38f6ba0edb8f3d)（长文收件箱 + 框架周报）

## 使用

```
/evolve                     # 自动选题
/evolve 帕金森病睡眠障碍      # 指定主题
```

每周日早上自动运行一次。看到好文章就丢进「长文收件箱」；读完周报在「评价」「我的批注」里反馈，下周的筛选会参考。

## 机制要点

- 进化的对象是**框架**，不是文章：每篇文章先抽成固定结构的“基因”，杂交时按模块交换。
- 理性分低于 4 直接淘汰（医学内容的证据底线）。
- 选择用多目标保留，不用三项平均分，避免收敛成平庸共识；同一子主题最多保留 2 个。
- 框架之间冲突的结论记为“张力”保留下来，不折中抹平。
