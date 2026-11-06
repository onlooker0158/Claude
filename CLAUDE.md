# 项目约定

## HTML 字体
所有生成的 HTML 页面（answer-me-with-html 页面、Artifact、手写 HTML）统一字体：
- 英文：Arial
- 中文：微软雅黑

CSS 写法：`font-family: Arial, "Microsoft YaHei", "微软雅黑", sans-serif;`（Arial 在前，中文字符自动落到微软雅黑）。

### answer-me-with-html
用自定义主题 `yahei-arial`（`.claude/skills/answer-me-with-html/themes/yahei-arial.json`）实现。云端会话每次是新容器，每个会话第一次 `am render` 前先运行一次：

```bash
bash .claude/skills/answer-me-with-html/themes/install.sh
```

它把主题装进 `~/.answer-me-with-html/themes/` 并设为默认主题。草稿里不要另写 `theme:`。

## 回答默认附 HTML 页（answer-me-with-html 常驻模式）
[answer-me-with-html always-on] 只要回复里给出了结论、总结、方案、对比、评审或讲解，就同时用 answer-me-with-html skill 生成一页 HTML（日常结论用 2～4 个面板），先渲染页面，再写文字回复。哪怕回答很短也要出，不要因为答案不长就跳过。闲聊、没有结论的一两句话、纯命令输出、我要求纯文本时除外。子 Agent 向父 Agent 汇报属于内部材料，不生成页面，除非任务明确要求。

本环境（Claude Code 网页版云端会话）的具体做法：
- 渲染时加 `--no-open`，并用 `-o "/home/user/Claude/.tmp/answers/<英文短名>.html"` 把页面存进工作目录（`.tmp/` 已被 git 忽略），否则用户在网页端打不开。
- 渲染成功后用 SendUserFile（`display: "render"`）把页面发给用户，再写 2～3 行文字回复：一句核心结论 + 页面路径。`file://` 链接在网页端无效，不要用。
- 内容结论仍以中国情况为准（见用户偏好）。
