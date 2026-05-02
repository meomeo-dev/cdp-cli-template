---
title: TUI 设计系统 MOC
created: 2026-05-02
updated: 2026-05-02
tags:
  - moc
note-type: "[[structure-note]]"
graph-label: Context
---

# TUI 设计系统 MOC

## 核心结构
- [[tui-design-systems-are-layered-constraints]] — TUI 设计系统应按基本原理、UX/UI、设计美学三层推进。

## 基本原理
- [[terminal-substrate-determines-tui-primitives]] — 字符网格、控制序列、能力协商、输入模式和 fallback 决定 TUI 原语。

## UX/UI
- [[tui-ux-patterns-are-interaction-contracts]] — TUI 模式应定义状态、输入、输出、发现路径、恢复路径与 fallback。
- [[command-mode-tui-preserves-cli-contracts]] — CLI command 场景下，TUI 是命令契约的渐进增强，不是 full-screen app 替代品。

## 设计美学
- [[tui-aesthetics-are-tokenized-constraints]] — TUI 美学应是语义 token 与可降级表达，而不是装饰堆叠。

## 研究记录
- Deep Research ID: `research_d20a7e0ec2774bfd8904fd1736c72d1b`
- 阶段审计: 基本原理、UX/UI、设计美学均通过。

## 离线证据
- [[raw/ecma-1991-control-functions]] — ECMA-48 控制函数标准。
- [[raw/xterm-2025-control-sequences]] — xterm/DEC 扩展、颜色、鼠标、备用屏幕。
- [[raw/ncurses-2026-terminfo]] — 终端能力数据库。
- [[raw/unicode-2025-east-asian-width]] — Unicode display width 风险。
- [[raw/ratatui-2026-terminal-abstraction]] — frame/buffer/render-loop 抽象。
- [[raw/clig-2025-command-line-guidelines]] — CLI 可组合性、TTY、stdout/stderr 边界。
- [[raw/fuchsia-2025-cli-guidance]] — 显式交互/非交互模式。
- [[raw/salesforce-2026-cli-interactivity]] — JSON 输出和 prompt suppression。
- [[raw/heroku-2025-cli-style-guide]] — action/output command 与 stderr 进度。
- [[raw/patternfly-2025-cli-handbook]] — CLI 交互、反馈和可访问性。
- [[raw/w3c-2026-aria-keyboard]] — 键盘焦点和 selection 模型。
- [[raw/w3c-2025-design-tokens]] — 设计 token 格式。
- [[raw/w3c-2023-wcag-color-motion]] — 色彩、焦点、动态可访问性。
- [[raw/rich-2025-console-api]] — 终端样式能力和 plain fallback。
