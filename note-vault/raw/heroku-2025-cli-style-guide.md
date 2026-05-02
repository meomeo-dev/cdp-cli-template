---
title: Heroku CLI 风格指南证据卡
created: 2026-05-02
author: Heroku
year: 2025
source: "https://devcenter.heroku.com/articles/cli-style-guide"
evidence-id: "evidence_08addcacd127460ea3028a5b8dd32b73"
trust-level: 5
retrieved: 2026-05-02
tags:
  - raw-source
  - cli
  - command-mode-tui
note-type: "[[raw-source]]"
links:
  - "[[command-mode-tui-preserves-cli-contracts]]"
---

# Heroku CLI 风格指南证据卡

## 离线摘要
Heroku CLI 风格指南区分 output commands 与 action commands，要求进度和 out-of-band 信息走 stderr，脚本场景提供 JSON/terse 输出，prompt 要能通过参数或 flags 绕过，非 TTY 时禁用颜色。

## 可支撑的规范条款
- 命令结果和交互状态必须分通道：stdout 结果，stderr 进度/提示/诊断。
- prompt 与确认必须可绕过，才能支持 CI 和脚本。
- command-mode TUI 的 loading/progress 只应在 TTY surface 显示。

## 连接
- [[command-mode-tui-preserves-cli-contracts]] — 支撑 action/output command 差异。

