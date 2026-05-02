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
