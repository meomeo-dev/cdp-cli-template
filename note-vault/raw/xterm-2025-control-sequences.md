---
title: XTerm 控制序列参考证据卡
created: 2026-05-02
author: Thomas E. Dickey
year: 2025
source: "https://invisible-island.net/xterm/ctlseqs/ctlseqs.html"
evidence-id: "evidence_572c2d6d34064ba28db9b78894ef7e93"
trust-level: 5
retrieved: 2026-05-02
tags:
  - raw-source
  - tui
  - terminal
note-type: "[[raw-source]]"
links:
  - "[[terminal-substrate-determines-tui-primitives]]"
  - "[[tui-aesthetics-are-tokenized-constraints]]"
---

# XTerm 控制序列参考证据卡

## 离线摘要
XTerm control sequences 是现实终端兼容层的重要参考，说明 ECMA-48、DEC 私有序列、xterm 扩展、SGR 颜色、鼠标追踪、备用屏幕、括号粘贴等功能如何在现代终端中表达。

## 可支撑的规范条款
- 能力矩阵应有 `xterm-compatible`、`mouse-enabled`、`bracketed-paste`、`alternate-screen`、`256-color`、`truecolor` 等维度。
- 颜色和鼠标是能力增强，不能成为唯一交互路径。
- full-screen TUI 使用 alternate screen 时必须定义退出恢复和异常恢复。

## 连接
- [[terminal-substrate-determines-tui-primitives]] — xterm 说明现实终端能力边界。
- [[tui-aesthetics-are-tokenized-constraints]] — 颜色/边框/样式 token 需要能力降级。

