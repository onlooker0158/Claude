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
