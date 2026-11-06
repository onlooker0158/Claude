#!/usr/bin/env bash
# 把仓库里的自定义主题装进 am 数据目录，并设为默认主题。重复运行无副作用。
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)"
home="${AM_HOME:-$HOME/.answer-me-with-html}"
mkdir -p "$home/themes"
cp "$dir/yahei-arial.json" "$home/themes/yahei-arial.json"
node "$dir/../scripts/am.mjs" config set theme yahei-arial >/dev/null
