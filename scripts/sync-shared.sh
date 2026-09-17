#!/usr/bin/env bash
# 从 orca-transition-skill 同步共用文件：设计变量、主题、逐帧录制脚本。
# 两个 skill 装在同一层目录下（~/.claude/skills/ 或 ~/ghq/github.com/zhenwusw/）。
# 这些文件以 orca-transition-skill 为准，不要在这里直接改。
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
src="${1:-$here/../orca-transition-skill}"
[ -f "$src/runtime/tokens.css" ] || { echo "找不到 orca-transition-skill：$src" >&2; exit 1; }
mkdir -p "$here/runtime/themes" "$here/scripts"
cp "$src/runtime/tokens.css" "$here/runtime/tokens.css"
rsync -a --delete "$src/runtime/themes/" "$here/runtime/themes/"
cp "$src/scripts/capture.mjs" "$here/scripts/capture.mjs"
echo "已同步：tokens.css、themes/、capture.mjs ← $src"
