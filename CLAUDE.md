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
